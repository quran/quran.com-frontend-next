import React from 'react';
import styles from './NoResults.module.scss';
import AdvancedSearchLink from '../AdvancedSearchLink';
import IconSearch from '../../../../../public/icons/search.svg';

interface Props {
  searchUrl: string;
  searchQuery: string;
}

const NoResults: React.FC<Props> = ({ searchQuery, searchUrl }) => (
  <>
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <IconSearch />
      </div>
      <p className={styles.mainMessage}>No results found</p>
      <p className={styles.secondaryMessage}>
        We could not find any matching search results for {`"${searchQuery}"`}. try searching for a
        different keyword.{' '}
      </p>
    </div>
    <AdvancedSearchLink searchUrl={searchUrl} />
  </>
);

export default NoResults;
