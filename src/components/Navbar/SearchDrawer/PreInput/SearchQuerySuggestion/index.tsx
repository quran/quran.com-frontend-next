import React from 'react';
import styles from './SearchQuerySuggestion.module.scss';

interface Props {
  searchQuery: string;
  onSearchKeywordClicked: (searchQuery: string) => void;
}

const SearchQuerySuggestion: React.FC<Props> = ({ searchQuery, onSearchKeywordClicked }) => (
  <button
    type="button"
    className={styles.container}
    onClick={() => onSearchKeywordClicked(searchQuery)}
  >
    {searchQuery}
  </button>
);

export default SearchQuerySuggestion;
