import React from 'react';
import Link from 'next/link';
import { getPageNavigationUrl } from 'src/utils/navigation';
import styles from './PageFooter.module.scss';

interface Props {
  page: number;
}

const PageFooter: React.FC<Props> = ({ page }) => {
  const pageUrl = getPageNavigationUrl(page);
  return (
    <div className={styles.pageText}>
      <Link href={pageUrl} passHref>
        <p className={styles.pageLink}>{`Page ${page}`}</p>
      </Link>
    </div>
  );
};

export default PageFooter;
