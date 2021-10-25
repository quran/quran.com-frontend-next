import React from 'react';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './NoResults.module.scss';

import AdvancedSearchLink from 'src/components/Navbar/SearchDrawer/AdvancedSearchLink';

interface Props {
  searchUrl?: string;
  searchQuery: string;
  isSearchDrawer: boolean;
}

const NoResults: React.FC<Props> = ({ searchQuery, searchUrl = '', isSearchDrawer }) => (
  <>
    <div className={styles.container}>
      <div className={styles.mainBody}>
        <div className={styles.iconContainer}>
          <IconSearch />
        </div>
        <p className={styles.mainMessage}>No results found</p>
        <p className={styles.secondaryMessage}>
          We could not find any matching search results for {`"${searchQuery}"`}. try searching for
          a different keyword.{' '}
        </p>
      </div>
    </div>
    {isSearchDrawer && <AdvancedSearchLink searchUrl={searchUrl} />}
  </>
);

export default NoResults;
