import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './AdvancedSearchLink.module.scss';

import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';

interface Props {
  searchUrl?: string;
}

const AdvancedSearchLink: React.FC<Props> = ({ searchUrl }) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.linkContainer}>
      <Link
        href={searchUrl || getSearchQueryNavigationUrl()}
        className={styles.link}
        onClick={() => {
          logButtonClick('search_drawer_advanced_search');
        }}
      >
        <p>{t('search.switch-mode')}</p>
      </Link>
    </div>
  );
};

export default AdvancedSearchLink;
