import React, { useMemo } from 'react';
import Chapter from 'types/Chapter';
import Verse from '../../../../types/Verse';
import Page from './Page';
import groupPagesByVerses from './groupPagesByVerses';
import styles from './ReadingView.module.scss';

type ReadingViewProps = {
  verses: Verse[];
  chapters: Record<string, Chapter>;
};

const ReadingView = ({ verses, chapters }: ReadingViewProps) => {
  const pages = useMemo(() => groupPagesByVerses(verses), [verses]);

  return (
    <div className={styles.container}>
      {Object.keys(pages).map((pageNumber) => (
        <Page
          chapters={chapters}
          verses={pages[pageNumber]}
          key={`page-${pageNumber}`}
          page={Number(pageNumber)}
        />
      ))}
    </div>
  );
};

export default React.memo(ReadingView);
