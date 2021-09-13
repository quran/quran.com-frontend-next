/* eslint-disable react/no-array-index-key */
import React from 'react';
import { selectSearchHistory } from 'src/redux/slices/Search/search';
import { shallowEqual, useSelector } from 'react-redux';
import styles from './SearchHistory.module.scss';
import Header from '../PreInput/Header';
import SearchQuerySuggestion from '../PreInput/SearchQuerySuggestion';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
}

const SearchHistory: React.FC<Props> = ({ onSearchKeywordClicked }) => {
  const searchHistory = useSelector(selectSearchHistory, shallowEqual);
  // if there are no recent search queries.
  if (!searchHistory.length) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <Header text="Recent searches" />
      {searchHistory.map((recentSearchQuery) => (
        <SearchQuerySuggestion
          searchQuery={recentSearchQuery}
          key={`${recentSearchQuery}`}
          onSearchKeywordClicked={onSearchKeywordClicked}
        />
      ))}
    </div>
  );
};

export default SearchHistory;
