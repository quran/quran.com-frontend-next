import React, { useMemo } from 'react';

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

export default React.memo(ReadingView);
