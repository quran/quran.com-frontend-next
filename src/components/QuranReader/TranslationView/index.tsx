/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { ListItem, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import useSWRImmutable from 'swr/immutable';

import { getRequestKey, verseFetcher } from '../api';
import useFetchPagesCount from '../hooks/useFetchTotalPages';
import onCopyQuranWords from '../onCopyQuranWords';
import QueryParamMessage from '../QueryParamMessage';

import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';
import TranslationViewCellSkeleton from './TranslatioViewCellSkeleton';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import Spinner from 'src/components/dls/Spinner/Spinner';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import useQcfFont from 'src/hooks/useQcfFont';
import Error from 'src/pages/_error';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { generateVerseKeysBetweenTwoVerseKeys } from 'src/utils/verseKeys';
import { VersesResponse } from 'types/ApiResponses';
import LookupRange from 'types/LookupRange';
import QueryParam from 'types/QueryParam';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

type TranslationViewProps = {
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  resourceId: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
};

const EndOfScrollingControls = dynamic(() => import('../EndOfScrollingControls'), {
  ssr: false,
  loading: () => <Spinner />,
});

/**
 * Get the total number of verses of the current view e.g. /2 or /juz/30 or /2/20-50
 * by using the totalRecords returned from BE which indicates how many verses there are.
 *
 * @param {VersesResponse} initialData
 * @returns {number}
 */
const getVersesCount = (initialData: VersesResponse): number => {
  return initialData.metaData.numberOfVerses as number;
};

const generateResourceVerseKeys = (lookupRange: LookupRange) =>
  generateVerseKeysBetweenTwoVerseKeys(lookupRange.from, lookupRange.to);

/**
 * Convert a verse index to a page number by dividing the index
 * by how many items there are in a page.
 *
 * @param {number} verseIndex
 * @param {VersesResponse} initialData
 * @returns {number}
 */
const verseIndexToApiPageNumber = (verseIndex: number, initialData: VersesResponse): number =>
  Math.floor(verseIndex / initialData.pagination.perPage) + 1;

const TranslationView = ({
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  resourceId,
}: TranslationViewProps) => {
  const [apiPageToVersesMap, setApiPageToVersesMap] = useState<Record<number, Verse[]>>({
    1: initialData.verses,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const {
    value: reciterId,
    isQueryParamDifferent: reciterQueryParamDifferent,
  }: { value: number; isQueryParamDifferent: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.Reciter,
  );
  const { lang } = useTranslation();
  const {
    value: selectedTranslations,
    isQueryParamDifferent: translationsQueryParamDifferent,
  }: { value: number[]; isQueryParamDifferent: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.Translations,
  );
  const {
    value: wordByWordLocale,
    isQueryParamDifferent: wordByWordLocaleQueryParamDifferent,
  }: { value: string; isQueryParamDifferent: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.WBW_LOCALE,
  );
  const { hasError, lookupRange } = useFetchPagesCount(
    resourceId,
    quranReaderDataType,
    initialData,
    quranReaderStyles,
  );
  const totalVersesCount = useMemo(() => getVersesCount(initialData), [initialData]);
  const resourceVerseKeys = useMemo(() => generateResourceVerseKeys(lookupRange), [lookupRange]);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  useScrollToVirtualizedVerse(quranReaderDataType, virtuosoRef);
  const { data } = useSWRImmutable(
    getRequestKey({
      quranReaderDataType,
      pageNumber: currentPage,
      initialData,
      quranReaderStyles,
      selectedTranslations,
      isVerseData: quranReaderDataType === QuranReaderDataType.Verse,
      isSelectedTafsirData: quranReaderDataType === QuranReaderDataType.SelectedTafsir,
      id: resourceId,
      reciter: reciterId,
      locale: lang,
      wordByWordLocale,
    }),
    verseFetcher,
  );
  const verses = useMemo(() => Object.values(apiPageToVersesMap).flat(), [apiPageToVersesMap]);
  useQcfFont(quranReaderStyles.quranFont, verses);
  useEffect(() => {
    if (data) {
      setApiPageToVersesMap((prevVerses) => ({ ...prevVerses, [currentPage]: data }));
    }
  }, [currentPage, data]);

  if (hasError) {
    return <Error />;
  }

  const itemContentRenderer = (currentVerseIndex: number) => {
    const versePage = verseIndexToApiPageNumber(currentVerseIndex, initialData);
    // if the page of the current verse has already been fetched
    if (apiPageToVersesMap[versePage]) {
      // search for the verse inside its page.
      const filteredVerses = apiPageToVersesMap[versePage].filter(
        (verse) => verse.verseKey === resourceVerseKeys[currentVerseIndex],
      );
      if (!filteredVerses.length) {
        return <TranslationViewCellSkeleton />;
      }
      return (
        <>
          {filteredVerses[0].verseNumber === 1 && (
            <ChapterHeader
              chapterId={String(filteredVerses[0].chapterId)}
              pageNumber={filteredVerses[0].pageNumber}
              hizbNumber={filteredVerses[0].hizbNumber}
            />
          )}
          <TranslationViewCell
            verseIndex={currentVerseIndex}
            verse={filteredVerses[0]}
            key={filteredVerses[0].id}
            quranReaderStyles={quranReaderStyles}
          />
        </>
      );
    }
    return <TranslationViewCellSkeleton />;
  };

  /**
   * Called with the new set of items each time the list items are rendered due to scrolling.
   *
   * The idea is that we check the boundaries of the current rendered range and check if
   * either side of the boundary lies outside of the boundaries of the current page, we
   * set the current page to it so that useSwr will fetch the verses of that page
   * (if it's has not been called before and cached already).
   *
   * @param {ListItem<Verse>[]} renderedVerses
   */
  const onItemsRendered = (renderedVerses: ListItem<Verse>[]) => {
    if (renderedVerses.length) {
      setCurrentPage((prevPage) => {
        const firstRenderedItemPage = verseIndexToApiPageNumber(
          renderedVerses[0].index,
          initialData,
        );
        // if the first verse is outside the current page
        if (firstRenderedItemPage !== prevPage) {
          return firstRenderedItemPage;
        }
        const lastRenderedItemPage = verseIndexToApiPageNumber(
          renderedVerses[renderedVerses.length - 1].index,
          initialData,
        );
        // if the last verse is outside the current page
        if (lastRenderedItemPage !== prevPage) {
          return lastRenderedItemPage;
        }
        return prevPage;
      });
    }
  };

  return (
    <>
      <QueryParamMessage
        translationsQueryParamDifferent={translationsQueryParamDifferent}
        reciterQueryParamDifferent={reciterQueryParamDifferent}
        wordByWordLocaleQueryParamDifferent={wordByWordLocaleQueryParamDifferent}
      />
      <div className={styles.container} onCopy={(event) => onCopyQuranWords(event, verses)}>
        <Virtuoso
          ref={virtuosoRef}
          useWindowScroll
          totalCount={totalVersesCount}
          overscan={800}
          initialItemCount={initialData.verses.length} // needed for SSR.
          itemsRendered={onItemsRendered}
          itemContent={itemContentRenderer}
          components={{
            Footer: () => (
              <EndOfScrollingControls
                quranReaderDataType={quranReaderDataType}
                lastVerse={verses[verses.length - 1]}
              />
            ),
          }}
        />
      </div>
    </>
  );
};

export default TranslationView;
