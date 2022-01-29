/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable react/no-multi-comp */
import React, { useMemo, useRef, useState, useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import useSWRImmutable from 'swr/immutable';

import useFetchPagesCount from './hooks/useFetchTotalPages';
import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import Page from './Page';
import styles from './ReadingView.module.scss';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import Spinner from 'src/components/dls/Spinner/Spinner';
import { getReaderViewRequestKey, verseFetcher } from 'src/components/QuranReader/api';
import onCopyQuranWords from 'src/components/QuranReader/onCopyQuranWords';
import QueryParamMessage from 'src/components/QuranReader/QueryParamMessage';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import useQcfFont from 'src/hooks/useQcfFont';
import Error from 'src/pages/_error';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

const EndOfScrollingControls = dynamic(
  () => import('src/components/QuranReader/EndOfScrollingControls'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

type ReadingViewProps = {
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  resourceId: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
};

const ReadingView = ({
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  resourceId,
}: ReadingViewProps) => {
  const initialFirstMushafPage = initialData.verses[0].pageNumber;
  const [mushafPageToVersesMap, setMushafPageToVersesMap] = useState<Record<number, Verse[]>>({
    [initialFirstMushafPage]: initialData.verses,
  });
  const { lang } = useTranslation();
  const [currentMushafPage, setCurrentMushafPage] = useState(initialFirstMushafPage);
  const verses = useMemo(
    () => Object.values(mushafPageToVersesMap).flat(),
    [mushafPageToVersesMap],
  );
  const {
    value: reciterId,
    isQueryParamDifferent: reciterQueryParamDifferent,
  }: { value: number; isQueryParamDifferent: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.Reciter,
  );
  const {
    value: wordByWordLocale,
    isQueryParamDifferent: wordByWordLocaleQueryParamDifferent,
  }: { value: string; isQueryParamDifferent: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.WBW_LOCALE,
  );
  useQcfFont(quranReaderStyles.quranFont, verses);
  const { pagesCount, hasError, pagesVersesRange } = useFetchPagesCount(
    resourceId,
    quranReaderDataType,
    initialData,
    quranReaderStyles,
  );
  const { data } = useSWRImmutable(
    getReaderViewRequestKey({
      pageNumber: currentMushafPage,
      pageVersesRange: pagesVersesRange[currentMushafPage],
      quranReaderStyles,
      reciter: reciterId,
      locale: lang,
      wordByWordLocale,
    }),
    verseFetcher,
  );
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { quranTextFontScale } = quranReaderStyles;
  useScrollToVirtualizedVerse(
    quranReaderDataType,
    virtuosoRef,
    initialData,
    quranReaderStyles,
    verses,
  );
  useEffect(() => {
    if (data) {
      setMushafPageToVersesMap((prevVerses) => ({ ...prevVerses, [currentMushafPage]: data }));
    }
  }, [currentMushafPage, data]);

  const itemContentRenderer = (currentPageIndex: number) => {
    const pageNumber = initialFirstMushafPage + currentPageIndex;
    const pageVerses = mushafPageToVersesMap[pageNumber];
    return pageVerses ? (
      <Page
        verses={pageVerses}
        key={`page-${pageNumber}`}
        page={Number(pageNumber)}
        quranReaderStyles={quranReaderStyles}
        pageIndex={currentPageIndex}
      />
    ) : (
      <ReadingViewSkeleton />
    );
  };

  const onItemsRendered = (renderedPages) => {
    if (renderedPages.length) {
      setCurrentMushafPage((prevMushafPage) => {
        const firstRenderedMushafPage = initialFirstMushafPage + renderedPages[0].index;
        if (firstRenderedMushafPage !== prevMushafPage) {
          return firstRenderedMushafPage;
        }
        const lastRenderedMushafPage =
          initialFirstMushafPage + renderedPages[renderedPages.length - 1].index;
        if (lastRenderedMushafPage !== prevMushafPage) {
          return lastRenderedMushafPage;
        }
        return prevMushafPage;
      });
    }
  };

  if (hasError) {
    return <Error />;
  }

  return (
    <>
      <QueryParamMessage
        translationsQueryParamDifferent={false}
        reciterQueryParamDifferent={reciterQueryParamDifferent}
        wordByWordLocaleQueryParamDifferent={wordByWordLocaleQueryParamDifferent}
      />
      <div
        onCopy={(event) => onCopyQuranWords(event, verses)}
        className={classNames(styles.container, {
          [styles.largeDesktopContainer]: quranTextFontScale === 4,
          [styles.xLargeDesktopContainer]: quranTextFontScale === 5,
        })}
      >
        <Virtuoso
          ref={virtuosoRef}
          useWindowScroll
          increaseViewportBy={300}
          style={{ width: '100%' }}
          itemsRendered={onItemsRendered}
          initialItemCount={1} // needed for SSR.
          totalCount={pagesCount}
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

export default ReadingView;
