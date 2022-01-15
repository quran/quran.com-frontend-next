/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable react/no-multi-comp */
import React, { useMemo, memo, useRef } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { ListRange, Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { verseFontChanged } from '../utils/memoization';

import groupPagesByVerses from './groupPagesByVerses';
import useScrollToReadingViewVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import Page from './Page';
import styles from './ReadingView.module.scss';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import Spinner from 'src/components/dls/Spinner/Spinner';
import useQcfFont from 'src/hooks/useQcfFont';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

const EndOfScrollingControls = dynamic(() => import('../EndOfScrollingControls'), {
  ssr: false,
  loading: () => <Spinner />,
});

type ReadingViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  setSize: (size: number | ((_size: number) => number)) => Promise<Verse[]>;
  initialData: VersesResponse;
};

const getTotalCount = (
  quranReaderDataType: QuranReaderDataType,
  initialData: VersesResponse,
): number => {
  if (quranReaderDataType === QuranReaderDataType.Verse) {
    return 1;
  }
  return initialData.pagination.totalPages;
};

const ReadingView = ({
  verses,
  quranReaderStyles,
  quranReaderDataType,
  setSize,
  initialData,
}: ReadingViewProps) => {
  useQcfFont(quranReaderStyles.quranFont, verses);
  const pages = useMemo(() => groupPagesByVerses(verses), [verses]);
  const pageNumbers = Object.keys(pages);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { quranTextFontScale } = quranReaderStyles;
  useScrollToReadingViewVirtualizedVerse(
    quranReaderDataType,
    virtuosoRef,
    initialData,
    quranReaderStyles,
    verses,
  );

  const onRangeChange = (range: ListRange) => {
    setSize(range.endIndex + 1);
  };

  const itemContentRenderer = (currentPageIndex: number) => {
    const pageNumber = pageNumbers[currentPageIndex];
    return pageNumber ? (
      <Page
        verses={pages[pageNumber]}
        key={`page-${pageNumber}`}
        page={Number(pageNumber)}
        quranReaderStyles={quranReaderStyles}
        pageIndex={currentPageIndex}
      />
    ) : (
      <ReadingViewSkeleton />
    );
  };

  return (
    <div
      className={classNames(styles.container, {
        [styles.largeDesktopContainer]: quranTextFontScale === 4,
        [styles.xLargeDesktopContainer]: quranTextFontScale === 5,
      })}
    >
      <Virtuoso
        ref={virtuosoRef}
        useWindowScroll
        overscan={800}
        style={{ width: '100%' }}
        rangeChanged={onRangeChange}
        initialItemCount={1} // needed for SSR.
        totalCount={getTotalCount(quranReaderDataType, initialData)}
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

/**
 * Since we are passing verses and it's an array
 * even if the same verses are passed, their reference will change
 * on fetching a new page and since Memo only does shallow comparison,
 * we need to use custom comparing logic:
 *
 *  1. Check if the number of verses are the same.
 *  2. Check if the fonts changed.
 *
 * If the above condition is met, it's safe to assume that the result
 * of both renders are the same.
 *
 * @param {ReadingViewProps} prevProps
 * @param {ReadingViewProps} nextProps
 * @returns {boolean}
 */
const areVersesEqual = (prevProps: ReadingViewProps, nextProps: ReadingViewProps): boolean =>
  prevProps.verses.length === nextProps.verses.length &&
  !verseFontChanged(
    prevProps.quranReaderStyles,
    nextProps.quranReaderStyles,
    prevProps.verses[0].words,
    nextProps.verses[0].words,
  );
export default memo(ReadingView, areVersesEqual);
