import React, { MouseEvent, KeyboardEvent } from 'react';

import CloseIcon from '../../../../../public/icons/close.svg';
import SearchIcon from '../../../../../public/icons/search.svg';
import SearchItem from '../SearchItem';

import styles from './SearchQuerySuggestion.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';

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
        url="/"
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
