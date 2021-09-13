import React, { MouseEvent, KeyboardEvent } from 'react';
import styles from './SearchQuerySuggestion.module.scss';
import IconClose from '../../../../../../public/icons/close.svg';

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
        <div
          role="button"
          tabIndex={0}
          className={styles.removeIcon}
          onKeyPress={(event) => onRemoveClicked(event, searchQuery)}
          onClick={(event) => onRemoveClicked(event, searchQuery)}
        >
          <IconClose />
        </div>
      )}
    </button>
  );
};

export default SearchQuerySuggestion;
