/* eslint-disable max-lines */
import React, { useState, useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR, { useSWRConfig } from 'swr';

import styles from './CollectionDetailView.module.scss';

import CollectionBulkActionsPopover from '@/components/Collection/CollectionActionsPopover/CollectionBulkActionsPopover';
import CollectionHeaderActionsPopover from '@/components/Collection/CollectionActionsPopover/CollectionHeaderActionsPopover';
import CollectionDetail from '@/components/Collection/CollectionDetail/CollectionDetail';
import CollectionSorter from '@/components/Collection/CollectionSorter/CollectionSorter';
import EditCollectionModal from '@/components/Collection/EditCollectionModal/EditCollectionModal';
import Button, { ButtonSize, ButtonVariant } from '@/components/dls/Button/Button';
import Error from '@/components/Error';
import DeleteCollectionModal from '@/components/MyQuran/DeleteCollectionModal';
import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import StudyModeContainer from '@/components/QuranReader/StudyModeContainer';
import VerseActionModalContainer from '@/components/QuranReader/VerseActionModalContainer';
import { ArrowDirection } from '@/dls/Sorter/Sorter';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useBookmarkCacheInvalidator from '@/hooks/useBookmarkCacheInvalidator';
import { broadcastPinnedVerses, PinnedVersesBroadcastType } from '@/hooks/usePinnedVersesBroadcast';
import ChevronLeft from '@/icons/chevron-left.svg';
import MenuMoreHorizIcon from '@/icons/menu_more_horiz.svg';
import { logErrorToSentry } from '@/lib/sentry';
import { pinVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
import { deleteCollectionBookmarkById, privateFetcher, syncPinnedItems } from '@/utils/auth/api';
import { makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { buildPinnedSyncPayload, isPinnedItemsCacheKey } from '@/utils/auth/pinnedItems';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { slugifiedCollectionIdToCollectionId } from '@/utils/string';
import { makeVerseKey } from '@/utils/verse';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

interface CollectionDetailViewProps {
  collectionId: string;
  collectionName: string;
  onBack: () => void;
  searchQuery?: string;
  isDefault?: boolean;
  onCollectionUpdateRequest?: (collectionId: string, newName: string) => Promise<boolean>;
  onCollectionDeleteRequest?: (collectionId: string) => Promise<boolean>;
}

const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  collectionId,
  collectionName,
  onBack,
  searchQuery,
  isDefault,
  onCollectionUpdateRequest,
  onCollectionDeleteRequest,
}) => {
  const { t, lang } = useTranslation('my-quran');
  const dispatch = useDispatch();
  const [sortBy, setSortBy] = useState(CollectionDetailSortOption.VerseKey);
  const toast = useToast();
  const { invalidateAllBookmarkCaches } = useBookmarkCacheInvalidator();
  const { isLoggedIn } = useIsLoggedIn();
  const { mutate: globalMutate } = useSWRConfig();
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalVerseKeys, setNoteModalVerseKeys] = useState<string[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onSortByChange = useCallback(
    (newSortByVal: CollectionDetailSortOption) => {
      logValueChange('collection_detail_page_sort_by', sortBy, newSortByVal);
      setSortBy(newSortByVal);
    },
    [sortBy],
  );

  // Fetch all bookmarks at once
  const fetchUrl = makeGetBookmarkByCollectionId(collectionId, {
    sortBy,
    type: BookmarkType.Ayah,
    limit: 10000,
  });

  const { data, mutate, error } = useSWR<GetBookmarkCollectionsIdResponse>(
    fetchUrl,
    privateFetcher,
  );

  const bookmarks = React.useMemo(() => {
    if (!data) return [];
    return data.data.bookmarks;
  }, [data]);

  const filteredBookmarks = React.useMemo(() => {
    if (!searchQuery) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter((bookmark) => {
      const verseKey = `${bookmark.key}:${bookmark.verseNumber}`;
      return verseKey.includes(query);
    });
  }, [bookmarks, searchQuery]);

  const isAllExpanded = React.useMemo(() => {
    return filteredBookmarks.length > 0 && expandedCardIds.size === filteredBookmarks.length;
  }, [filteredBookmarks, expandedCardIds]);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => {
      if (prev) setSelectedBookmarks(new Set());
      return !prev;
    });
    logButtonClick('collection_detail_toggle_select_mode', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      isEntering: !isSelectMode,
    });
  }, [collectionId, isSelectMode]);

  const handleToggleExpandCollapseAll = useCallback(() => {
    const allIds = new Set(filteredBookmarks.map((b) => b.id));
    const params = { collectionId: slugifiedCollectionIdToCollectionId(collectionId) };

    if (isAllExpanded) {
      setExpandedCardIds(new Set());
      logButtonClick('collection_detail_collapse_all', params);
    } else {
      setExpandedCardIds(allIds);
      logButtonClick('collection_detail_expand_all', params);
    }
  }, [filteredBookmarks, isAllExpanded, collectionId]);

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
    (bookmarkId: string) => expandedCardIds.has(bookmarkId),
    [expandedCardIds],
  );

  const isBookmarkSelected = useCallback(
    (bookmarkId: string) => selectedBookmarks.has(bookmarkId),
    [selectedBookmarks],
  );

  const handleNoteClick = useCallback(() => {
    const verseKeys = filteredBookmarks.map((bookmark) =>
      makeVerseKey(bookmark.key, bookmark.verseNumber),
    );

    setNoteModalVerseKeys(verseKeys);
    setIsNoteModalOpen(true);

    logButtonClick('collection_detail_note_click', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      selectedCount: selectedBookmarks.size,
      isBulkAction: false,
    });
  }, [collectionId, filteredBookmarks, selectedBookmarks.size]);

  const handleBulkNoteClick = useCallback(() => {
    const selectedBookmarksList = filteredBookmarks.filter((bookmark) =>
      selectedBookmarks.has(bookmark.id),
    );

    const verseKeys = selectedBookmarksList.map((bookmark) =>
      makeVerseKey(bookmark.key, bookmark.verseNumber),
    );

    setNoteModalVerseKeys(verseKeys);
    setIsNoteModalOpen(true);

    logButtonClick('collection_detail_bulk_note_click', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      selectedCount: selectedBookmarks.size,
    });
  }, [collectionId, filteredBookmarks, selectedBookmarks]);

  const handleNoteModalClose = useCallback(() => {
    setIsNoteModalOpen(false);
    setNoteModalVerseKeys([]);
  }, []);

  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
    logButtonClick('collection_detail_edit_click', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
    });
  }, [collectionId]);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleEditSubmit = useCallback(
    async (formData: { name: string }) => {
      const numericCollectionId = slugifiedCollectionIdToCollectionId(collectionId);

      // Optimistic: close modal immediately
      setIsEditModalOpen(false);

      // Parent's update handler has optimistic updates built-in
      const success = await onCollectionUpdateRequest?.(numericCollectionId, formData.name);
      if (success === true) {
        toast(t('collection:edit-collection-success'), { status: ToastStatus.Success });
        logButtonClick('collection_edit_success', { collectionId: numericCollectionId });
      } else if (success === false) {
        toast(t('common:error.general'), { status: ToastStatus.Error });
        logButtonClick('collection_edit_failed', { collectionId: numericCollectionId });
      }
    },
    [collectionId, toast, t, onCollectionUpdateRequest],
  );

  const handleDeleteClick = useCallback(() => {
    logButtonClick('collection_detail_delete_click', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
    });
    setIsDeleteModalOpen(true);
  }, [collectionId]);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    logButtonClick('collection_delete_cancel', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
    });
  }, [collectionId]);

  const handleDeleteConfirm = useCallback(async () => {
    const numericCollectionId = slugifiedCollectionIdToCollectionId(collectionId);
    logButtonClick('collection_delete_confirm', { collectionId: numericCollectionId });
    setIsDeleting(true);

    if (onCollectionDeleteRequest) {
      const success = await onCollectionDeleteRequest(numericCollectionId);
      setIsDeleting(false);
      if (success) {
        setIsDeleteModalOpen(false);
        toast(t('collection:delete-collection-success'), { status: ToastStatus.Success });
        invalidateAllBookmarkCaches();
      } else {
        toast(t('common:error.general'), { status: ToastStatus.Error });
      }
    }
  }, [collectionId, onCollectionDeleteRequest, toast, t, invalidateAllBookmarkCaches]);

  const pinVersesAndSync = useCallback(
    async (verseKeys: string[]) => {
      dispatch(pinVerses(verseKeys));
      verseKeys.forEach((vk) => {
        broadcastPinnedVerses(PinnedVersesBroadcastType.PIN, { verseKey: vk });
      });

      if (isLoggedIn) {
        try {
          const syncPayload = verseKeys.map((vk) => buildPinnedSyncPayload(vk, mushafId));
          await syncPinnedItems(syncPayload);
          globalMutate(isPinnedItemsCacheKey, undefined, { revalidate: true });
        } catch (syncError) {
          logErrorToSentry(syncError, { transactionName: 'collectionDetail.pinVerses' });
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
            actions: [{ text: t('common:retry'), onClick: () => pinVersesAndSync(verseKeys) }],
          });
          return;
        }
      }

      toast(t('quran-reader:verses-pinned', { count: verseKeys.length }), {
        status: ToastStatus.Success,
      });
    },
    [dispatch, isLoggedIn, mushafId, globalMutate, toast, t],
  );

  const handlePinAllVerses = useCallback(() => {
    const verseKeys = filteredBookmarks.map((b) => makeVerseKey(b.key, b.verseNumber));
    logButtonClick('collection_detail_pin_all_verses', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      count: verseKeys.length,
    });
    pinVersesAndSync(verseKeys);
  }, [filteredBookmarks, collectionId, pinVersesAndSync]);

  const handlePinSelectedVerses = useCallback(() => {
    const selected = filteredBookmarks.filter((b) => selectedBookmarks.has(b.id));
    const verseKeys = selected.map((b) => makeVerseKey(b.key, b.verseNumber));
    logButtonClick('collection_detail_pin_selected_verses', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      count: verseKeys.length,
    });
    pinVersesAndSync(verseKeys);
  }, [filteredBookmarks, selectedBookmarks, collectionId, pinVersesAndSync]);

  if (error) {
    return (
      <div className={styles.statusContainer}>
        <Error onRetryClicked={() => mutate()} error={error} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.statusContainer}>
        <Spinner size={SpinnerSize.Large} />
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

  const isOwner = data?.data?.isOwner;
  const totalCount = data?.data?.bookmarks.length ?? 0;

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
          <span>{collectionName}</span>
        </Button>
        <div className={styles.badgeContainer}>
          <span className={styles.badge}>
            {totalCount === 1
              ? t('collections.items', { count: toLocalizedNumber(totalCount, lang) })
              : t('collections.items_plural', { count: toLocalizedNumber(totalCount, lang) })}
          </span>
          <CollectionHeaderActionsPopover
            onNoteClick={handleNoteClick}
            onPinVersesClick={handlePinAllVerses}
            onEditClick={isDefault ? undefined : handleEditClick}
            onDeleteClick={isDefault ? undefined : handleDeleteClick}
            dataTestPrefix="collection-header-actions"
          >
            <button type="button" className={styles.iconButton} aria-label={t('common:more')}>
              <MenuMoreHorizIcon />
            </button>
          </CollectionHeaderActionsPopover>
        </div>
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
            {selectedBookmarks.size > 0 ? (
              <CollectionBulkActionsPopover
                onNoteClick={handleBulkNoteClick}
                onPinVersesClick={handlePinSelectedVerses}
                dataTestPrefix="collection-bulk-actions"
              >
                <Button
                  variant={ButtonVariant.Ghost}
                  size={ButtonSize.XSmall}
                  className={styles.bulkActionButton}
                >
                  {t('bulk-actions.actions-count', {
                    count: toLocalizedNumber(selectedBookmarks.size, lang),
                  })}
                </Button>
              </CollectionBulkActionsPopover>
            ) : (
              <Button
                variant={ButtonVariant.Ghost}
                size={ButtonSize.XSmall}
                className={styles.bulkActionButton}
                isDisabled
              >
                {t('bulk-actions.actions')}
              </Button>
            )}
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
        onItemDeleted={onItemDeleted}
        isOwner={isOwner}
        shouldShowTitle={false}
        onBack={onBack}
        isSelectMode={isSelectMode}
        onToggleBookmarkSelection={handleToggleBookmarkSelection}
        onToggleCardExpansion={handleToggleCardExpansion}
        isCardExpanded={isCardExpanded}
        isBookmarkSelected={isBookmarkSelected}
      />

      <StudyModeContainer />
      <VerseActionModalContainer />

      <AddNoteModal
        showRanges
        isModalOpen={isNoteModalOpen}
        onModalClose={handleNoteModalClose}
        onMyNotes={handleNoteModalClose}
        verseKeys={noteModalVerseKeys}
      />

      <EditCollectionModal
        isOpen={isEditModalOpen}
        defaultValue={collectionName}
        onSubmit={handleEditSubmit}
        onClose={handleEditModalClose}
      />

      <DeleteCollectionModal
        isOpen={isDeleteModalOpen}
        collectionName={collectionName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteModalClose}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CollectionDetailView;
