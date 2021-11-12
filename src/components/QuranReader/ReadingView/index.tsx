import React, { useMemo, memo } from 'react';

import { verseFontChanged } from '../utils/memoization';

import groupPagesByVerses from './groupPagesByVerses';
import Page from './Page';
import styles from './ReadingView.module.scss';

import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import Verse from 'types/Verse';

type ReadingViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const ReadingView = ({ verses, quranReaderStyles }: ReadingViewProps) => {
  const pages = useMemo(() => groupPagesByVerses(verses), [verses]);

  return (
    <div className={styles.container}>
      {Object.keys(pages).map((pageNumber) => (
        <Page
          verses={pages[pageNumber]}
          key={`page-${pageNumber}`}
          page={Number(pageNumber)}
          quranReaderStyles={quranReaderStyles}
        />
      ))}
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
