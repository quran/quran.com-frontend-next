/* eslint-disable react/no-array-index-key */
import React from 'react';
import { selectRecentSearchQueries } from 'src/redux/slices/Search/search';
import { useSelector } from 'react-redux';
import styles from './RecentSearchQueries.module.scss';
import Header from '../PreInput/Header';
import SearchQuerySuggestion from '../PreInput/SearchQuerySuggestion';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
}

const RecentSearchQueries: React.FC<Props> = ({ onSearchKeywordClicked }) => {
  const recentSearchQueries = useSelector(selectRecentSearchQueries);
  // if there are no recent search queries.
  if (!recentSearchQueries.length) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <Header text="Recent searches" />
      {recentSearchQueries.map((recentSearchQuery, index) => (
        <SearchQuerySuggestion
          searchQuery={recentSearchQuery}
          key={`${recentSearchQuery}${index}`} // using index to avoid having duplicate keys when we have the same search query twice.
          onSearchKeywordClicked={onSearchKeywordClicked}
        />
      ))}
    </div>
  );
};

export default RecentSearchQueries;
