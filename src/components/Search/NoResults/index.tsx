import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NoResults.module.scss';

import { SearchIcon } from 'src/components/Icons';
import AdvancedSearchLink from 'src/components/Navbar/SearchDrawer/AdvancedSearchLink';

interface Props {
  searchUrl?: string;
  searchQuery: string;
  isSearchDrawer: boolean;
}

const NoResults: React.FC<Props> = ({ searchQuery, searchUrl = '', isSearchDrawer }) => {
  const { t } = useTranslation('common');
  return (
    <>
      <div className={styles.container}>
        <div className={styles.mainBody}>
          <div className={styles.iconContainer}>
            <SearchIcon />
          </div>
          <p className={styles.mainMessage}>{t('search.no-results')}</p>
          <p className={styles.secondaryMessage}>
            {t('search.no-results-suggestion', { searchQuery })}
          </p>
        </div>
      </div>
      {isSearchDrawer && <AdvancedSearchLink searchUrl={searchUrl} />}
    </>
  );
};

export default NoResults;
