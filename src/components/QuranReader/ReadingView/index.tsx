/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable react/no-multi-comp */
import React, { useCallback, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useSelector } from 'react-redux';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { getPageIndexByPageNumber } from '../utils/page';

import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import PageContainer from './PageContainer';
import PageNavigationButtons from './PageNavigationButtons';
import styles from './ReadingView.module.scss';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import useFetchPagesLookup from '@/components/QuranReader/hooks/useFetchPagesLookup';
import onCopyQuranWords from '@/components/QuranReader/onCopyQuranWords';
import QueryParamMessage from '@/components/QuranReader/QueryParamMessage';
import Spinner from '@/dls/Spinner/Spinner';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import useGetQueryParamOrXstateValue from '@/hooks/useGetQueryParamOrXstateValue';
import useQcfFont from '@/hooks/useQcfFont';
import { selectedLastReadPage } from '@/redux/slices/QuranReader/readingTracker';
import { selectIsUsingDefaultFont } from '@/redux/slices/QuranReader/styles';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { logButtonClick } from '@/utils/eventLogger';
import { getLineWidthClassName } from '@/utils/fontFaceHelper';
import Error from 'src/pages/_error';
import { VersesResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

const EndOfScrollingControls = dynamic(
  () => import('@/components/QuranReader/EndOfScrollingControls'),
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
  }: { value: number; isQueryParamDifferent: boolean } = useGetQueryParamOrXstateValue(
    QueryParam.RECITER,
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
    virtuosoRef.current.scrollToIndex({
      index: currentPageIndex - 1,
      align: 'start',
      offset: -35,
    });
  }, [currentPageIndex]);

  const scrollToNextPage = useCallback(() => {
    virtuosoRef.current.scrollToIndex({
      index: currentPageIndex + 1,
      align: 'start',
      offset: 25,
    });
  }, [currentPageIndex]);

  const onPrevPageClicked = useCallback(() => {
    logButtonClick('reading_view_prev_page_button');
    scrollToPreviousPage();
  }, [scrollToPreviousPage]);

  const onNextPageClicked = useCallback(() => {
    logButtonClick('reading_view_next_page_button');
    scrollToNextPage();
  }, [scrollToNextPage]);

  const allowKeyboardNavigation = quranTextFontScale <= 5;
  const onUpClicked = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      scrollToPreviousPage();
    },
    [scrollToPreviousPage],
  );

  const onDownClicked = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      scrollToNextPage();
    },
    [scrollToNextPage],
  );

  useHotkeys('Up', onUpClicked, { enabled: allowKeyboardNavigation }, [scrollToPreviousPage]);
  useHotkeys('Down', onDownClicked, { enabled: allowKeyboardNavigation }, [scrollToNextPage]);

  const itemContentRenderer = (pageIndex: number) => {
    if (pageIndex === pagesCount) {
      const pageVerses = mushafPageToVersesMap[lastReadPageNumber];
      const lastVerse = pageVerses?.[pageVerses.length - 1];
      if (!lastVerse) return null;

      return (
        <EndOfScrollingControls
          quranReaderDataType={quranReaderDataType}
          lastVerse={lastVerse}
          initialData={initialData}
        />
      );
    }

    return (
      <PageContainer
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
  };

  if (hasError) {
    return <Error />;
  }

  const shouldShowQueryParamMessage =
    reciterQueryParamDifferent || wordByWordLocaleQueryParamDifferent;

  return (
    <>
      {shouldShowQueryParamMessage && (
        <QueryParamMessage
          translationsQueryParamDifferent={false}
          reciterQueryParamDifferent={reciterQueryParamDifferent}
          wordByWordLocaleQueryParamDifferent={wordByWordLocaleQueryParamDifferent}
        />
      )}
      <div
        onCopy={(event) => onCopyQuranWords(event, verses, quranFont)}
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
            totalCount={pagesCount + 1}
            itemContent={itemContentRenderer}
          />
        )}
      </div>
      {allowKeyboardNavigation && (
        <PageNavigationButtons
          scrollToNextPage={onNextPageClicked}
          scrollToPreviousPage={onPrevPageClicked}
        />
      )}
    </>
  );
};

export default ReadingView;
