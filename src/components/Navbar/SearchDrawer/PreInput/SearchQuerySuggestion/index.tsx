import React, { MouseEvent, KeyboardEvent } from 'react';
import styles from './SearchQuerySuggestion.module.scss';

interface Props {
  searchQuery: string;
  onSearchKeywordClicked: (searchQuery: string) => void;
  onRemoveSearchQueryClicked?: (searchQuery: string) => void;
}

const SearchQuerySuggestion: React.FC<Props> = ({
  searchQuery,
  onSearchKeywordClicked,
  onRemoveSearchQueryClicked,
}) => {
  const onRemoveClicked = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
    toBeDeletedSearchQuery: string,
  ) => {
    event.stopPropagation();
    onRemoveSearchQueryClicked(toBeDeletedSearchQuery);
  };

  return (
    <button
      type="button"
      className={styles.container}
      onClick={() => onSearchKeywordClicked(searchQuery)}
    >
      <p>{searchQuery}</p>

      {onRemoveSearchQueryClicked && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={(event) => onRemoveClicked(event, searchQuery)}
        >
          Remove
        </button>
      )}
    </button>
  );
};

export default SearchQuerySuggestion;
