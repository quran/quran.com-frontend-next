import React, { MouseEvent, KeyboardEvent } from 'react';

import SearchResultItemIcon from '../../SearchResults/SearchResultItemIcon';
import SearchItem from '../SearchItem';

import styles from './SearchQuerySuggestion.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';
import { SearchNavigationType } from '@/types/Search/SearchNavigationResult';

interface Props {
  searchQuery: string;
  onSearchKeywordClicked: (searchQuery: string) => void;
  onRemoveSearchQueryClicked?: (searchQuery: string) => void;
  type: SearchNavigationType;
}

const SearchQuerySuggestion: React.FC<Props> = ({
  searchQuery,
  onSearchKeywordClicked,
  onRemoveSearchQueryClicked,
  type,
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
        prefix={<SearchResultItemIcon type={type} />}
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
