/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable react/no-multi-comp */
import React, { useCallback, useMemo, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useHotkeys } from 'react-hotkeys-hook';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import PageContainer from './PageContainer';
import PageNavigationButtons from './PageNavigationButtons';
import styles from './ReadingView.module.scss';

import Spinner from 'src/components/dls/Spinner/Spinner';
import useFetchPagesCount from 'src/components/QuranReader/hooks/useFetchTotalPages';
import onCopyQuranWords from 'src/components/QuranReader/onCopyQuranWords';
import QueryParamMessage from 'src/components/QuranReader/QueryParamMessage';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import useQcfFont from 'src/hooks/useQcfFont';
import Error from 'src/pages/_error';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { logButtonClick } from 'src/utils/eventLogger';
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
  const { lang } = useTranslation('quran-reader');
  const currentPageIndex = useRef<number>(0);
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
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  useScrollToVirtualizedVerse(
    quranReaderDataType,
    virtuosoRef,
    initialData,
    quranReaderStyles,
    verses,
    pagesVersesRange,
  );

  const scrollToPreviousPage = useCallback(() => {
    logButtonClick('reading_view_prev_page');
    virtuosoRef.current.scrollToIndex({
      index: currentPageIndex.current - 1,
      align: 'start',
      offset: -35,
    });
  }, []);

  const scrollToNextPage = useCallback(() => {
    logButtonClick('reading_view_next_page');
    virtuosoRef.current.scrollToIndex({
      index: currentPageIndex.current + 1,
      align: 'start',
      offset: 10,
    });
  }, []);

  useHotkeys(
    'Up',
    (event: KeyboardEvent) => {
      event.preventDefault();
      scrollToPreviousPage();
    },
    [scrollToPreviousPage],
  );
  useHotkeys(
    'Down',
    (event: KeyboardEvent) => {
      event.preventDefault();
      scrollToNextPage();
    },
    [scrollToNextPage],
  );

  const itemContentRenderer = (pageIndex: number) => (
    <PageContainer
      pagesVersesRange={pagesVersesRange}
      quranReaderStyles={quranReaderStyles}
      reciterId={reciterId}
      lang={lang}
      wordByWordLocale={wordByWordLocale}
      pageNumber={initialFirstMushafPage + pageIndex}
      pageIndex={pageIndex}
      setMushafPageToVersesMap={setMushafPageToVersesMap}
      initialData={initialData}
      quranReaderDataType={quranReaderDataType}
    />
  );

  if (hasError) {
    return <Error />;
  }

  /**
   * A callback triggered each time the list of pages are rendered due to scrolling.
   */
  const onPagesRendered = (renderedPages) => {
    if (renderedPages[0]) {
      currentPageIndex.current = renderedPages[0].index + 1;
    }
  };

  return (
    <>
      <QueryParamMessage
        translationsQueryParamDifferent={false}
        reciterQueryParamDifferent={reciterQueryParamDifferent}
        wordByWordLocaleQueryParamDifferent={wordByWordLocaleQueryParamDifferent}
      />
      <div onCopy={(event) => onCopyQuranWords(event, verses)} className={styles.container}>
        <Virtuoso
          ref={virtuosoRef}
          useWindowScroll
          increaseViewportBy={300}
          className={styles.virtuosoScroller}
          initialItemCount={1} // needed for SSR.
          totalCount={pagesCount}
          itemContent={itemContentRenderer}
          itemsRendered={onPagesRendered}
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
      <PageNavigationButtons
        scrollToNextPage={scrollToNextPage}
        scrollToPreviousPage={scrollToPreviousPage}
      />
    </>
  );
};

export default ReadingView;
