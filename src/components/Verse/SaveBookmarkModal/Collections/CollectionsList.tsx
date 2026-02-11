import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './collections.module.scss';
import CollectionsListItem, { CollectionItem } from './CollectionsListItem';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import PlusIcon from '@/icons/plus-cubed.svg';

interface CollectionsListProps {
  collections: CollectionItem[];
  isDataReady: boolean;
  isTogglingFavorites: boolean;
  onCollectionToggle: (collection: CollectionItem, checked: boolean) => Promise<void>;
  onNewCollectionClick?: () => void;
  hideNewCollection?: boolean;
}

/**
 * Collections list component
 * Displays collections with toggle functionality
 * @returns {React.FC<CollectionsListProps>} The CollectionsList component
 */
const CollectionsList: React.FC<CollectionsListProps> = ({
  collections,
  isDataReady,
  isTogglingFavorites,
  onCollectionToggle,
  onNewCollectionClick,
  hideNewCollection = false,
}) => {
  const { t } = useTranslation('quran-reader');

  const handleCollectionKeyDown = useCallback(
    (e: React.KeyboardEvent, collection: CollectionItem): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCollectionToggle(collection, !collection.checked);
      }
    },
    [onCollectionToggle],
  );

  return (
    <div className={styles.collectionsSection}>
      <div className={styles.collectionsHeader}>
        <span className={styles.collectionsTitle}>{t('collections')}</span>
        {!hideNewCollection && (
          <Button
            variant={ButtonVariant.Ghost}
            size={ButtonSize.Small}
            onClick={onNewCollectionClick}
            className={styles.newCollectionButton}
          >
            <PlusIcon className={styles.plusIcon} />
            {t('new-collection')}
          </Button>
        )}
      </div>

      <div className={styles.collectionsList}>
        {!isDataReady && (
          <div className={styles.loadingContainer}>
            <Spinner />
          </div>
        )}
        {isDataReady && collections.length === 0 && (
          <div className={styles.emptyCollections}>{t('no-collections')}</div>
        )}
        {isDataReady &&
          collections.map((collection) => (
            <CollectionsListItem
              key={collection.id}
              collection={collection}
              isTogglingFavorites={isTogglingFavorites}
              onToggle={onCollectionToggle}
              onKeyDown={handleCollectionKeyDown}
            />
          ))}
      </div>
    </div>
  );
};

export default CollectionsList;
