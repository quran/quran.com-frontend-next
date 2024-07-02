import React, { MouseEvent, KeyboardEvent } from 'react';

import SearchItem from '../SearchItem';

import styles from './SearchQuerySuggestion.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';
import SearchIcon from '@/icons/search.svg';

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
    <div className={styles.searchSuggestion}>
      <SearchItem
        title={searchQuery}
        prefix={<SearchIcon />}
        onClick={() => onSearchKeywordClicked(searchQuery)}
        suffix={
          onRemoveSearchQueryClicked && (
            <Button
              shape={ButtonShape.Circle}
              onClick={(event) =>
                onRemoveClicked(
                  // @ts-ignore
                  event,
                  searchQuery,
                )
              }
              variant={ButtonVariant.Ghost}
              size={ButtonSize.Small}
            >
              <CloseIcon />
            </Button>
          )
        }
      />
    </div>
  );
};

export default SearchQuerySuggestion;
