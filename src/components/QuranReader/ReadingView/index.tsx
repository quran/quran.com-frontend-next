import React, { useMemo, memo } from 'react';

import groupPagesByVerses from './groupPagesByVerses';
import Page from './Page';
import styles from './ReadingView.module.scss';

import Verse from 'types/Verse';

type ReadingViewProps = {
  verses: Verse[];
};

const ReadingView = ({ verses }: ReadingViewProps) => {
  const pages = useMemo(() => groupPagesByVerses(verses), [verses]);

  return (
    <div className={styles.container}>
      {Object.keys(pages).map((pageNumber) => (
        <Page verses={pages[pageNumber]} key={`page-${pageNumber}`} page={Number(pageNumber)} />
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
 *
 * If the above condition is met, it's safe to assume that the result
 * of both renders are the same.
 *
 * @param {ReadingViewProps} prevProps
 * @param {ReadingViewProps} nextProps
 * @returns {boolean}
 */
const areVersesEqual = (prevProps: ReadingViewProps, nextProps: ReadingViewProps): boolean => {
  return prevProps.verses.length === nextProps.verses.length;
};
export default memo(ReadingView, areVersesEqual);
