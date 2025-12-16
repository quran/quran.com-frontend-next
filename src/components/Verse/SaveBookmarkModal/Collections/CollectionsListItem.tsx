import React, { useCallback } from 'react';

import classNames from 'classnames';

import styles from '../SaveBookmarkModal.module.scss';

import Spinner from '@/dls/Spinner/Spinner';
import BookmarkIcon from '@/icons/bookmark.svg';
import CheckIcon from '@/icons/check.svg';

export interface CollectionItem {
  id: string;
  name: string;
  checked: boolean;
  updatedAt?: string;
  isDefault?: boolean;
}

interface CollectionsListItemProps {
  collection: CollectionItem;
  isTogglingFavorites: boolean;
  onToggle: (collection: CollectionItem, checked: boolean) => Promise<void>;
  onKeyDown: (e: React.KeyboardEvent, collection: CollectionItem) => void;
}

const CollectionsListItem: React.FC<CollectionsListItemProps> = ({
  collection,
  isTogglingFavorites,
  onToggle,
  onKeyDown,
}) => {
  const handleClick = useCallback((): void => {
    onToggle(collection, !collection.checked);
  }, [collection, onToggle]);

  const renderTrailingIndicator = useCallback((): React.ReactNode => {
    if (collection.isDefault && isTogglingFavorites) {
      return <Spinner />;
    }

    if (collection.checked) {
      return (
        <div className={classNames(styles.checkIcon, styles.checked)}>
          <CheckIcon />
        </div>
      );
    }

    return <div className={styles.checkbox} />;
  }, [collection, isTogglingFavorites]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      onKeyDown(e, collection);
    },
    [collection, onKeyDown],
  );

  return (
    <div
      className={classNames(styles.collectionItem, {
        [styles.selected]: collection.checked,
        [styles.defaultCollection]: collection.isDefault,
      })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles.collectionIcon}>
        <BookmarkIcon />
      </div>
      <span className={styles.collectionName}>{collection.name}</span>
      {renderTrailingIndicator()}
    </div>
  );
};

export default CollectionsListItem;
