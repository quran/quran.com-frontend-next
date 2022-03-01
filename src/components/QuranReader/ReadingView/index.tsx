/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable react/no-multi-comp */
import React, { useCallback, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useSelector } from 'react-redux';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import PageContainer from './PageContainer';
import PageNavigationButtons from './PageNavigationButtons';
import styles from './ReadingView.module.scss';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import Spinner from 'src/components/dls/Spinner/Spinner';
import useFetchPagesLookup from 'src/components/QuranReader/hooks/useFetchPagesLookup';
import onCopyQuranWords from 'src/components/QuranReader/onCopyQuranWords';
import QueryParamMessage from 'src/components/QuranReader/QueryParamMessage';
import { getPageIndexByPageNumber } from 'src/components/QuranReader/utils/page';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import useQcfFont from 'src/hooks/useQcfFont';
import Error from 'src/pages/_error';
import { selectedLastReadPage } from 'src/redux/slices/QuranReader/readingTracker';
import { selectIsUsingDefaultFont } from 'src/redux/slices/QuranReader/styles';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { logButtonClick } from 'src/utils/eventLogger';
import { getLineWidthClassName } from 'src/utils/fontFaceHelper';
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

const INCREASE_VIEWPORT_BY_PIXELS = 1200;

const ReadingView = ({
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  resourceId,
}: ReadingViewProps) => {
  const [mushafPageToVersesMap, setMushafPageToVersesMap] = useState<Record<number, Verse[]>>({
    [initialData.verses[0].pageNumber]: initialData.verses,
  });
  const { lang } = useTranslation('quran-reader');
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const lastReadPageNumber = useSelector(selectedLastReadPage, shallowEqual);
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
  const { quranFont, mushafLines, quranTextFontScale } = quranReaderStyles;
  useQcfFont(quranFont, verses);
  const { pagesCount, hasError, pagesVersesRange, isLoading } = useFetchPagesLookup(
    resourceId,
    quranReaderDataType,
    initialData,
    quranReaderStyles,
    isUsingDefaultFont,
  );
  const currentPageIndex = useMemo(
    () => getPageIndexByPageNumber(Number(lastReadPageNumber), pagesVersesRange),
    [lastReadPageNumber, pagesVersesRange],
  );
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  useScrollToVirtualizedVerse(
    quranReaderDataType,
    virtuosoRef,
    initialData,
    quranReaderStyles,
    verses,
    pagesVersesRange,
    isUsingDefaultFont,
    quranFont,
    mushafLines,
    isLoading,
  );

  const scrollToPreviousPage = useCallback(() => {
    logButtonClick('reading_view_prev_page');
    virtuosoRef.current.scrollToIndex({
      index: currentPageIndex - 1,
      align: 'start',
      offset: -35,
    });
  }, [currentPageIndex]);

  const scrollToNextPage = useCallback(() => {
    logButtonClick('reading_view_next_page');
    virtuosoRef.current.scrollToIndex({
      index: currentPageIndex + 1,
      align: 'start',
      offset: 25,
    });
  }, [currentPageIndex]);

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
      isUsingDefaultFont={isUsingDefaultFont}
      pagesVersesRange={pagesVersesRange}
      quranReaderStyles={quranReaderStyles}
      reciterId={reciterId}
      lang={lang}
      wordByWordLocale={wordByWordLocale}
      pageIndex={pageIndex}
      setMushafPageToVersesMap={setMushafPageToVersesMap}
      initialData={initialData}
    />
  );

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
        className={classNames(
          styles.container,
          styles[getLineWidthClassName(quranFont, quranTextFontScale, mushafLines)],
        )}
      >
        {isLoading ? (
          <div className={styles.virtuosoScroller}>
            <ReadingViewSkeleton />
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            useWindowScroll
            increaseViewportBy={INCREASE_VIEWPORT_BY_PIXELS}
            className={styles.virtuosoScroller}
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
        )}
      </div>
      <PageNavigationButtons
        scrollToNextPage={scrollToNextPage}
        scrollToPreviousPage={scrollToPreviousPage}
      />
    </>
  );
};

export default ReadingView;
