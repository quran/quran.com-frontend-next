/* eslint-disable max-lines */
import React, { useState, useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRInfinite from 'swr/infinite';

import styles from './CollectionDetailView.module.scss';

import CollectionDetail from '@/components/Collection/CollectionDetail/CollectionDetail';
import CollectionSorter from '@/components/Collection/CollectionSorter/CollectionSorter';
import Button, { ButtonSize, ButtonVariant } from '@/components/dls/Button/Button';
import StudyModeContainer from '@/components/QuranReader/StudyModeContainer';
import VerseActionModalContainer from '@/components/QuranReader/VerseActionModalContainer';
import { ArrowDirection } from '@/dls/Sorter/Sorter';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useBookmarkCacheInvalidator from '@/hooks/useBookmarkCacheInvalidator';
import ChevronLeft from '@/icons/chevron-left.svg';
import BookmarkType from '@/types/BookmarkType';
import { deleteCollectionBookmarkById, privateFetcher } from '@/utils/auth/api';
import { makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { slugifiedCollectionIdToCollectionId } from '@/utils/string';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

interface CollectionDetailViewProps {
  collectionId: string;
  collectionName: string;
  onBack: () => void;
  searchQuery?: string;
}

const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  collectionId,
  collectionName,
  onBack,
  searchQuery,
}) => {
  const { t, lang } = useTranslation('my-quran');
  const [sortBy, setSortBy] = useState(CollectionDetailSortOption.VerseKey);
  const toast = useToast();
  const { invalidateAllBookmarkCaches } = useBookmarkCacheInvalidator();

  // Bulk actions state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  const onSortByChange = (newSortByVal) => {
    logValueChange('collection_detail_page_sort_by', sortBy, newSortByVal);
    setSortBy(newSortByVal);
  };

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data) return null;
    if (pageIndex === 0) {
      return makeGetBookmarkByCollectionId(collectionId, {
        sortBy,
        type: BookmarkType.Ayah,
      });
    }
    const cursor = previousPageData.pagination?.endCursor;
    return makeGetBookmarkByCollectionId(collectionId, {
      sortBy,
      cursor,
      type: BookmarkType.Ayah,
    });
  };

  const { data, size, setSize, mutate, isValidating, error } =
    useSWRInfinite<GetBookmarkCollectionsIdResponse>(getKey, privateFetcher);

  const bookmarks = React.useMemo(() => {
    if (!data) return [];
    return data.map((response) => response.data.bookmarks).flat();
  }, [data]);

  const filteredBookmarks = React.useMemo(() => {
    if (!searchQuery) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter((bookmark) => {
      // You can expand this to search by chapter name if needed
      // For now, search by verse key
      const verseKey = `${bookmark.key}:${bookmark.verseNumber}`;
      return verseKey.includes(query);
    });
  }, [bookmarks, searchQuery]);

  // Bulk actions handlers (defined after filteredBookmarks to avoid reference errors)
  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => {
      const newValue = !prev;
      if (prev) {
        // Clear selections when exiting select mode
        setSelectedBookmarks(new Set());
      }
      return newValue;
    });
    logButtonClick('collection_detail_toggle_select_mode', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      isEntering: !isSelectMode,
    });
  }, [collectionId, isSelectMode]);

  const handleToggleExpandCollapseAll = useCallback(() => {
    const allIds = new Set(filteredBookmarks.map((b) => b.id));
    const isAllExpanded =
      filteredBookmarks.length > 0 && expandedCardIds.size === filteredBookmarks.length;

    if (isAllExpanded) {
      // Collapse all
      setExpandedCardIds(new Set());
      logButtonClick('collection_detail_collapse_all', {
        collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      });
    } else {
      // Expand all
      setExpandedCardIds(allIds);
      logButtonClick('collection_detail_expand_all', {
        collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      });
    }
  }, [filteredBookmarks, expandedCardIds, collectionId]);

  const isAllExpanded = React.useMemo(() => {
    return filteredBookmarks.length > 0 && expandedCardIds.size === filteredBookmarks.length;
  }, [filteredBookmarks, expandedCardIds]);

  const handleToggleBookmarkSelection = useCallback((bookmarkId: string) => {
    setSelectedBookmarks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId);
      } else {
        newSet.add(bookmarkId);
      }
      return newSet;
    });
  }, []);

  const handleToggleCardExpansion = useCallback((bookmarkId: string) => {
    setExpandedCardIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId);
      } else {
        newSet.add(bookmarkId);
      }
      return newSet;
    });
  }, []);

  const isCardExpanded = useCallback(
    (bookmarkId: string) => {
      return expandedCardIds.has(bookmarkId);
    },
    [expandedCardIds],
  );

  const isBookmarkSelected = useCallback(
    (bookmarkId: string) => {
      return selectedBookmarks.has(bookmarkId);
    },
    [selectedBookmarks],
  );

  if (error) {
    return <div>{t('common:error.general')}</div>;
  }

  if (!data) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner shouldDelayVisibility size={SpinnerSize.Large} />
      </div>
    );
  }

  const onUpdated = () => {
    mutate();
    invalidateAllBookmarkCaches();
  };

  const onItemDeleted = (bookmarkId: string) => {
    deleteCollectionBookmarkById(collectionId, bookmarkId)
      .then(() => {
        onUpdated();
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      });
  };

  const lastPageData = data[data.length - 1];
  const { hasNextPage } = lastPageData.pagination;

  const isOwner = data[0]?.data?.isOwner;

  const loadMore = () => {
    setSize(size + 1);
    logButtonClick('collection_detail_page_load_more', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      page: size + 1,
    });
  };

  const isLoadingMoreData = bookmarks?.length > 0 && size > 1 && isValidating;

  // Get total count from the first page data
  const totalCount =
    data?.[0]?.data?.collection.bookmarksCount ||
    data?.[0]?.data?.collection.count ||
    data?.[0]?.data?.bookmarks.length ||
    0;

  const sortOptions = [
    {
      id: CollectionDetailSortOption.RecentlyAdded,
      label: t('collection:recently-added'),
      direction: ArrowDirection.Down,
    },
    {
      id: CollectionDetailSortOption.VerseKey,
      label: t('collection:verse-key'),
      direction: ArrowDirection.Up,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topActions}>
        <CollectionSorter
          selectedOptionId={sortBy}
          onChange={onSortByChange}
          options={sortOptions}
          isSingleCollection
          collectionId={slugifiedCollectionIdToCollectionId(collectionId)}
        />
      </div>

      <div className={styles.header}>
        <Button onClick={onBack} variant={ButtonVariant.Ghost} className={styles.backButton}>
          <ChevronLeft />
        </Button>
        <div className={styles.headerContent}>
          <span className={styles.title}>{collectionName}</span>
        </div>
        <span className={styles.badge}>
          {totalCount === 1
            ? t('collections.items', { count: toLocalizedNumber(totalCount, lang) })
            : t('collections.items_plural', { count: toLocalizedNumber(totalCount, lang) })}
        </span>
      </div>

      <div className={styles.bulkActionsContainer}>
        <Button
          variant={ButtonVariant.Ghost}
          size={ButtonSize.XSmall}
          className={styles.bulkActionButton}
          onClick={handleToggleExpandCollapseAll}
        >
          {isAllExpanded ? t('bulk-actions.collapse-all') : t('bulk-actions.expand-all')}
        </Button>

        {isSelectMode ? (
          <div className={styles.selectModeActions}>
            <Button
              variant={ButtonVariant.Ghost}
              size={ButtonSize.XSmall}
              className={styles.bulkActionButton}
              onClick={toggleSelectMode}
            >
              {t('bulk-actions.cancel')}
            </Button>
            <Button
              variant={ButtonVariant.Ghost}
              size={ButtonSize.XSmall}
              className={styles.bulkActionButton}
              onClick={toggleSelectMode}
              isDisabled={selectedBookmarks.size === 0}
            >
              {t(
                selectedBookmarks.size > 0 ? 'bulk-actions.actions-count' : 'bulk-actions.actions',
                { count: toLocalizedNumber(selectedBookmarks.size, lang) },
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant={ButtonVariant.Ghost}
            className={styles.bulkActionButton}
            size={ButtonSize.XSmall}
            onClick={toggleSelectMode}
          >
            {t('bulk-actions.select')}
          </Button>
        )}
      </div>

      <CollectionDetail
        id={slugifiedCollectionIdToCollectionId(collectionId)}
        title={collectionName}
        bookmarks={filteredBookmarks}
        sortBy={sortBy}
        onSortByChange={onSortByChange}
        onItemDeleted={onItemDeleted}
        isOwner={isOwner}
        shouldShowTitle={false}
        onBack={onBack}
        isSelectMode={isSelectMode}
        selectedBookmarks={selectedBookmarks}
        expandedCardIds={expandedCardIds}
        onToggleBookmarkSelection={handleToggleBookmarkSelection}
        onToggleCardExpansion={handleToggleCardExpansion}
        isCardExpanded={isCardExpanded}
        isBookmarkSelected={isBookmarkSelected}
      />

      {isLoadingMoreData && <Spinner size={SpinnerSize.Large} />}
      {hasNextPage && (
        <div className={styles.loadMoreContainer}>
          <Button onClick={loadMore} variant={ButtonVariant.Outlined}>
            {t('collection:load-more')}
          </Button>
        </div>
      )}
      <StudyModeContainer />
      <VerseActionModalContainer />
    </div>
  );
};

export default CollectionDetailView;
