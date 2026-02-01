import React from 'react';

import styles from './CollectionsList.module.scss';

import IconContainer, { IconSize } from '@/components/dls/IconContainer/IconContainer';
import { CollectionItem } from '@/hooks/useCollections';
import BookmarkFilled from '@/icons/bookmark_new.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';

interface CollectionListItemProps {
  collection: CollectionItem;
  isLast: boolean;
  itemsLabel: string;
  onClick: (collection: CollectionItem) => void;
}

const CollectionListItem: React.FC<CollectionListItemProps> = ({
  collection,
  isLast,
  itemsLabel,
  onClick,
}) => (
  <button
    type="button"
    className={`${styles.collectionItem} ${isLast ? styles.lastItem : ''}`}
    onClick={() => onClick(collection)}
  >
    <div className={styles.collectionIcon}>
      <BookmarkFilled />
    </div>
    <span className={styles.collectionName}>{collection.name}</span>
    {collection.itemCount !== undefined && (
      <div className={styles.collectionBadge}>
        <span className={styles.collectionCount}>{itemsLabel}</span>
        <IconContainer
          icon={<ChevronRightIcon />}
          size={IconSize.Custom}
          shouldFlipOnRTL
          shouldForceSetColors={false}
          className={styles.collectionBadgeIcon}
        />
      </div>
    )}
  </button>
);

export default CollectionListItem;
