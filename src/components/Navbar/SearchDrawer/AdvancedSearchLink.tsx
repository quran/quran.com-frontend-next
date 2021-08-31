import Link from 'next/link';
import React from 'react';
import { getSearchQueryNavigationUrl } from 'src/utils/navigation';
import styles from './AdvancedSearchLink.module.scss';

interface Props {
  searchUrl?: string;
}

const AdvancedSearchLink: React.FC<Props> = ({ searchUrl }) => (
  <div className={styles.linkContainer}>
    <Link href={searchUrl || getSearchQueryNavigationUrl()} passHref>
      <a className={styles.link}>
        <p>Switch to Advanced Search</p>
      </a>
    </Link>
  </div>
);

export default AdvancedSearchLink;
