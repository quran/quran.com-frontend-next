/* eslint-disable react/no-multi-comp */
import React, { useMemo, memo, useRef } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { verseFontChanged } from '../utils/memoization';

import groupPagesByVerses from './groupPagesByVerses';
import Page from './Page';
import styles from './ReadingView.module.scss';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { setLastReadVerse } from 'src/redux/slices/QuranReader/readingTracker';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
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
};

const ReadingView = ({ verses, quranReaderStyles, quranReaderDataType }: ReadingViewProps) => {
  const pages = useMemo(() => groupPagesByVerses(verses), [verses]);
  const pageNumbers = Object.keys(pages);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const dispatch = useDispatch();
  const { quranTextFontScale } = quranReaderStyles;
  const [firstPage] = pageNumbers;
  const [firstVerseOfFirstPage] = pages[firstPage];
  const showChapterHeader = firstVerseOfFirstPage.verseNumber === 1;

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
        overscan={1}
        style={{ width: '100%' }}
        rangeChanged={(range) => {
          const pageNumber = pageNumbers[range.startIndex];
          const firstVisibleVerse = pages[pageNumber][0];
          dispatch({
            type: setLastReadVerse.type,
            payload: {
              verseKey: firstVisibleVerse.verseKey,
              chapterId: firstVisibleVerse.chapterId,
              page: firstVisibleVerse.pageNumber,
              hizb: firstVisibleVerse.hizbNumber,
            },
          });
        }}
        initialItemCount={1} // needed for SSR
        totalCount={pageNumbers.length}
        itemContent={(index) => {
          const pageNumber = pageNumbers[index];
          return pageNumber ? (
            <Page
              verses={pages[pageNumber]}
              key={`page-${pageNumber}`}
              page={Number(pageNumber)}
              quranReaderStyles={quranReaderStyles}
              pageIndex={index}
            />
          ) : null;
        }}
        components={{
          Footer: () => (
            <EndOfScrollingControls
              quranReaderDataType={quranReaderDataType}
              lastVerse={verses[verses.length - 1]}
            />
          ),
          ...(showChapterHeader && {
            Header: () => (
              <ChapterHeader
                chapterId={firstVerseOfFirstPage.chapterId}
                pageNumber={firstVerseOfFirstPage.pageNumber}
                hizbNumber={firstVerseOfFirstPage.hizbNumber}
              />
            ),
          }),
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
