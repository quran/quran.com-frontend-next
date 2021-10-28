import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

import styles from './AdvancedSearchLink.module.scss';

import { getSearchQueryNavigationUrl } from 'src/utils/navigation';

interface Props {
  searchUrl?: string;
}

const AdvancedSearchLink: React.FC<Props> = ({ searchUrl }) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.linkContainer}>
      <Link href={searchUrl || getSearchQueryNavigationUrl()} passHref>
        <a className={styles.link}>
          <p>{t('search.switch-mode')}</p>
        </a>
      </Link>
    </div>
  );
};

export default AdvancedSearchLink;
