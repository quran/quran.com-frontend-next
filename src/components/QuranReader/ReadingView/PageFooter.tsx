import React from 'react';
import Link from 'next/link';
import styles from './PageFooter.module.scss';

interface Props {
  page: number;
}

const PageFooter: React.FC<Props> = ({ page }) => (
  <div className={styles.pageText}>
    <Link href={`/page/${page}`}>
      <p className={styles.pageLink}>{`Page ${page}`}</p>
    </Link>
  </div>
);

export default PageFooter;
