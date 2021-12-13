import React, { MouseEvent, KeyboardEvent } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './SearchQuerySuggestion.module.scss';

import Button, { ButtonVariant } from 'src/components/dls/Button/Button';

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
  const { t } = useTranslation('common');
  const onRemoveClicked = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
    toBeDeletedSearchQuery: string,
  ) => {
    event.stopPropagation();
    onRemoveSearchQueryClicked(toBeDeletedSearchQuery);
  };

  return (
    <Button
      className={classNames(styles.container, styles.searchQuerySuggestion)}
      variant={ButtonVariant.Ghost}
      hasBorder
      onClick={() => onSearchKeywordClicked(searchQuery)}
      fullWidth
      suffix={
        onRemoveSearchQueryClicked && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={(event) => onRemoveClicked(event, searchQuery)}
          >
            {t('remove')}
          </button>
        )
      }
    >
      {searchQuery}
    </Button>
  );
};

export default SearchQuerySuggestion;
