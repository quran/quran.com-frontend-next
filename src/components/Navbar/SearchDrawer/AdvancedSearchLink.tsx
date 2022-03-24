import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './AdvancedSearchLink.module.scss';

import Link from 'src/components/dls/Link/Link';
import { logButtonClick } from 'src/utils/eventLogger';
import { getSearchQueryNavigationUrl } from 'src/utils/navigation';

interface Props {
  searchUrl?: string;
}

const AdvancedSearchLink: React.FC<Props> = ({ searchUrl }) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.linkContainer}>
      <Link
        href={searchUrl || getSearchQueryNavigationUrl()}
        shouldPassHref
        onClick={() => {
          logButtonClick('search_drawer_advanced_search');
        }}
      >
        <a className={styles.link}>
          <p>{t('search.switch-mode')}</p>
        </a>
      </Link>
    </div>
  );
};

export default AdvancedSearchLink;
