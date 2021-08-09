import React, { useMemo } from 'react';
import Verse from '../../../../types/Verse';
import Page from './Page';
import groupPagesByVerses from './groupPagesByVerses';
import styles from './PageView.module.scss';

type PageViewProps = {
  verses: Verse[];
};

const PageView = ({ verses }: PageViewProps) => {
  const pages = useMemo(() => groupPagesByVerses(verses), [verses]);

  return (
    <div className={styles.container}>
      {Object.keys(pages).map((pageNumber) => (
        <Page verses={pages[pageNumber]} key={`page-${pageNumber}`} page={Number(pageNumber)} />
      ))}
    </div>
  );
};

export default React.memo(PageView);
