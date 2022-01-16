/* eslint-disable react/no-multi-comp */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { shallowEqual, useSelector } from 'react-redux';
import { ListItem, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import useSWRImmutable from 'swr/immutable';

import { getRequestKey, verseFetcher, DEFAULT_ITEMS_PER_PAGE } from '../api';
import onCopyQuranWords from '../onCopyQuranWords';

import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';
import TranslationViewCellSkeleton from './TranslatioViewCellSkeleton';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import Spinner from 'src/components/dls/Spinner/Spinner';
import useQcfFont from 'src/hooks/useQcfFont';
import { selectReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectWordByWordLocale } from 'src/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { areArraysEqual } from 'src/utils/array';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

type TranslationViewProps = {
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  id: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
};

const EndOfScrollingControls = dynamic(() => import('../EndOfScrollingControls'), {
  ssr: false,
  loading: () => <Spinner />,
});

/**
 * Get the total number of verses of the current view e.g. /2 or /juz/30 or /2/20-50
 * by using the totalRecords returned from BE which indicates how many verses there are.
 *
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {VersesResponse} initialData
 * @returns {number}
 */
const getVersesTotalCount = (
  quranReaderDataType: QuranReaderDataType,
  initialData: VersesResponse,
): number => {
  if (quranReaderDataType === QuranReaderDataType.Verse) {
    return 1;
  }
  return initialData.pagination.totalRecords;
};

/**
 * Convert a verse index to a page number by dividing the index
 * by how many items there are in a page.
 *
 * @param {number} verseIndex
 * @returns {number}
 */
const verseIndexToPageNumber = (verseIndex: number): number =>
  Math.floor(verseIndex / DEFAULT_ITEMS_PER_PAGE) + 1;

const TranslationView = ({
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  id,
}: TranslationViewProps) => {
  const [pageVerses, setPageVerses] = useState<Record<number, Verse[]>>({ 1: initialData.verses });
  const [currentPage, setCurrentPage] = useState(1);
  const reciter = useSelector(selectReciter, shallowEqual);
  const { lang } = useTranslation();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const wordByWordLocale = useSelector(selectWordByWordLocale);
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
      id,
      reciter: reciter.id,
      locale: lang,
      wordByWordLocale,
    }),
    verseFetcher,
  );
  const verses = useMemo(() => Object.values(pageVerses).flat(), [pageVerses]);
  useQcfFont(quranReaderStyles.quranFont, verses);
  useEffect(() => {
    if (data) {
      setPageVerses((prevVerses) => ({ ...prevVerses, [currentPage]: data }));
    }
  }, [currentPage, data]);

  const itemContentRenderer = (currentVerseIndex: number) => {
    const versePage = verseIndexToPageNumber(currentVerseIndex);
    // if the page of the current verse has already been fetched
    if (pageVerses[versePage]) {
      // search for the verse inside its page.
      const filteredVerses = pageVerses[versePage].filter(
        (verse) => verse.verseNumber === initialData.verses[0].verseNumber + currentVerseIndex,
      );
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
   * @param {ListItem<Verse>[]} items
   */
  const onItemsRendered = (items: ListItem<Verse>[]) => {
    if (items.length) {
      setCurrentPage((prevPage) => {
        const firstRenderedItemPage = verseIndexToPageNumber(items[0].index);
        // if the first verse is outside the current page
        if (firstRenderedItemPage !== prevPage) {
          return firstRenderedItemPage;
        }
        const lastRenderedItemPage = verseIndexToPageNumber(items[items.length - 1].index);
        // if the last verse is outside the current page
        if (lastRenderedItemPage !== prevPage) {
          return lastRenderedItemPage;
        }
        return prevPage;
      });
    }
  };

  return (
    <div className={styles.container} onCopy={(event) => onCopyQuranWords(event, verses)}>
      <Virtuoso
        ref={virtuosoRef}
        useWindowScroll
        totalCount={getVersesTotalCount(quranReaderDataType, initialData)}
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
  );
};

export default TranslationView;
