import React, { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import CollectionListItem from './CollectionListItem';
import CollectionsGuestPromo from './CollectionsGuestPromo';
import styles from './CollectionsList.module.scss';
import CollectionsListSkeleton from './CollectionsListSkeleton';
import getCollectionsSortOptions from './CollectionsSortOptions';

import Select from '@/components/dls/Forms/Select';
import { CollectionItem, CollectionSortOption } from '@/hooks/useCollections';
import SortIcon from '@/icons/arrows-vertical.svg';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import PlusIcon from '@/icons/plus.svg';
import { toLocalizedNumber } from '@/utils/locale';
import { ROUTES } from '@/utils/navigation';

export interface CollectionsListProps {
  collections: CollectionItem[];
  isLoading: boolean;
  isGuest: boolean;
  sortBy: CollectionSortOption;
  onSortChange: (sortBy: CollectionSortOption) => void;
  onNewCollectionClick?: () => void;
  onCollectionClick?: (collection: CollectionItem) => void;
}

const INITIAL_DISPLAY_COUNT = 10;
const PAGE_SIZE = 10;
const ITEM_HEIGHT = 60;
const MAX_VISIBLE_ITEMS = 5;
const LIST_HEIGHT = ITEM_HEIGHT * MAX_VISIBLE_ITEMS;

const CollectionsList: React.FC<CollectionsListProps> = ({
  collections,
  isLoading,
  isGuest,
  sortBy,
  onSortChange,
  onNewCollectionClick,
  onCollectionClick,
}) => {
  const { t, lang } = useTranslation('my-quran');
  const router = useRouter();
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  const handleCollectionClick = useCallback(
    (collection: CollectionItem) => {
      if (onCollectionClick) {
        onCollectionClick(collection);
      } else if (collection.isDefault) {
        router.push(ROUTES.COLLECTIONS_ALL);
      } else {
        router.push(`/collections/${collection.id}`);
      }
    },
    [onCollectionClick, router],
  );

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, collections.length));
  }, [collections.length]);

  // Sort collections: Default first, then by selected sort option
  const sortedCollections = useMemo(() => {
    const sorted = [...collections];
    if (sortBy === CollectionSortOption.ALPHABETICAL_ASC) {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === CollectionSortOption.ALPHABETICAL_DESC) {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // RECENTLY_UPDATED - already sorted by API
    }

    return [...sorted];
  }, [collections, sortBy]);

  const displayedCollections = sortedCollections.slice(0, displayCount);
  const hasMore = displayCount < sortedCollections.length;

  const sortOptions = useMemo(() => getCollectionsSortOptions(t), [t]);
  if (isGuest) {
    return <CollectionsGuestPromo />;
  }

  if (isLoading) {
    return <CollectionsListSkeleton />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('collections.title')}</h3>
        <div className={styles.headerActions}>
          {onNewCollectionClick && (
            <button
              type="button"
              className={styles.newCollectionButton}
              onClick={onNewCollectionClick}
            >
              <PlusIcon /> {t('collections.new-collection')}
            </button>
          )}
          <div className={styles.sortContainer}>
            <SortIcon className={styles.sortIcon} />
            <Select
              id="collections-sort"
              name="sort"
              options={sortOptions}
              value={sortBy}
              onChange={(value) => onSortChange(value as CollectionSortOption)}
              withBackground={false}
              defaultStyle={false}
              arrowClassName={styles.selectArrow}
              className={styles.sortSelect}
              placeholder={t('search.sort')}
            />
          </div>
        </div>
      </div>

      <div className={styles.listContainer}>
        <Virtuoso
          style={{ height: Math.min(displayedCollections.length * ITEM_HEIGHT, LIST_HEIGHT) }}
          totalCount={displayedCollections.length}
          itemContent={(index) => {
            const collection = displayedCollections[index];
            return (
              <CollectionListItem
                key={collection.id}
                collection={collection}
                isLast={index === displayedCollections.length - 1}
                itemsLabel={t('collections.items', {
                  count: toLocalizedNumber(collection.itemCount ?? 0, lang),
                })}
                onClick={handleCollectionClick}
              />
            );
          }}
        />
      </div>

      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <button type="button" className={styles.loadMoreButton} onClick={handleLoadMore}>
            {t('collections.load-more')}
            <ChevronDownIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionsList;
