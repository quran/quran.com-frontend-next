/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import React, { useCallback, useContext, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR, { useSWRConfig } from 'swr';

import styles from './CollectionDetailView.module.scss';

import CollectionBulkActionsPopover from '@/components/Collection/CollectionActionsPopover/CollectionBulkActionsPopover';
import CollectionHeaderActionsPopover from '@/components/Collection/CollectionActionsPopover/CollectionHeaderActionsPopover';
import CollectionDetail from '@/components/Collection/CollectionDetail/CollectionDetail';
import buildVerseCopyText from '@/components/Collection/CollectionDetail/utils/buildVerseCopyText';
import fetchVerseForCopy from '@/components/Collection/CollectionDetail/utils/fetchVerseForCopy';
import CollectionSorter from '@/components/Collection/CollectionSorter/CollectionSorter';
import DeleteBookmarkModal from '@/components/Collection/DeleteBookmarkModal/DeleteBookmarkModal';
import EditCollectionModal from '@/components/Collection/EditCollectionModal';
import Button, { ButtonSize, ButtonVariant } from '@/components/dls/Button/Button';
import Error from '@/components/Error';
import DeleteCollectionModal from '@/components/MyQuran/DeleteCollectionModal';
import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import ShareQuranModal from '@/components/QuranReader/ReadingView/ShareQuranModal';
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
import { RootState } from '@/redux/RootState';
import { pinVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
import { areArraysEqual } from '@/utils/array';
import { deleteCollectionBookmarkById, privateFetcher, syncPinnedItems } from '@/utils/auth/api';
import { makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { buildPinnedSyncPayload, isPinnedItemsCacheKey } from '@/utils/auth/pinnedItems';
import { textToBlob } from '@/utils/blob';
import { getChapterData } from '@/utils/chapter';
import copyText from '@/utils/copyText';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { QURAN_URL, getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import { slugifiedCollectionIdToCollectionId } from '@/utils/string';
import { makeVerseKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

// Limit concurrency to avoid spamming the QDC API when copying/deleting many verses.
const BULK_ACTIONS_CONCURRENCY_LIMIT = 5;
// We fetch all bookmarks at once in collection details view.
const COLLECTION_BOOKMARKS_LIMIT = 10000;
const SINGLE_ITEM_COUNT = 1;

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
  const chaptersData = useContext(DataContext);
  const { invalidateAllBookmarkCaches } = useBookmarkCacheInvalidator();
  const { isLoggedIn } = useIsLoggedIn();
  const { mutate: globalMutate } = useSWRConfig();
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(
    (state: RootState) => state.translations?.selectedTranslations ?? [],
    areArraysEqual,
  );
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalVerseKeys, setNoteModalVerseKeys] = useState<string[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareVerseKey, setShareVerseKey] = useState<string | null>(null);
  const [isDeleteBookmarksModalOpen, setIsDeleteBookmarksModalOpen] = useState(false);
  const [isDeletingBookmarks, setIsDeletingBookmarks] = useState(false);
  const [pendingDeleteBookmarkIds, setPendingDeleteBookmarkIds] = useState<string[]>([]);

  const onSortByChange = useCallback(
    (newSortByVal: CollectionDetailSortOption) => {
      logValueChange('collection_detail_page_sort_by', sortBy, newSortByVal);
      setSortBy(newSortByVal);
    },
    [sortBy],
  );

  const numericCollectionId = slugifiedCollectionIdToCollectionId(collectionId);

  // Fetch all bookmarks at once
  const fetchUrl = makeGetBookmarkByCollectionId(numericCollectionId, {
    sortBy,
    type: BookmarkType.Ayah,
    limit: COLLECTION_BOOKMARKS_LIMIT,
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

  const onUpdated = useCallback(() => {
    mutate();
    invalidateAllBookmarkCaches();
  }, [invalidateAllBookmarkCaches, mutate]);

  const isAllExpanded = React.useMemo(() => {
    return filteredBookmarks.length > 0 && expandedCardIds.size === filteredBookmarks.length;
  }, [filteredBookmarks, expandedCardIds]);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => {
      if (prev) setSelectedBookmarks(new Set());
      return !prev;
    });
    logButtonClick('collection_detail_toggle_select_mode', {
      collectionId: numericCollectionId,
      isEntering: !isSelectMode,
    });
  }, [numericCollectionId, isSelectMode]);

  const handleToggleExpandCollapseAll = useCallback(() => {
    const allIds = new Set(filteredBookmarks.map((b) => b.id));
    const params = { collectionId: numericCollectionId };

    if (isAllExpanded) {
      setExpandedCardIds(new Set());
      logButtonClick('collection_detail_collapse_all', params);
    } else {
      setExpandedCardIds(allIds);
      logButtonClick('collection_detail_expand_all', params);
    }
  }, [filteredBookmarks, isAllExpanded, numericCollectionId]);

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
      collectionId: numericCollectionId,
      selectedCount: selectedBookmarks.size,
      isBulkAction: false,
    });
  }, [numericCollectionId, filteredBookmarks, selectedBookmarks.size]);

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
      collectionId: numericCollectionId,
      selectedCount: selectedBookmarks.size,
    });
  }, [numericCollectionId, filteredBookmarks, selectedBookmarks]);

  const handleNoteModalClose = useCallback(() => {
    setIsNoteModalOpen(false);
    setNoteModalVerseKeys([]);
  }, []);

  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
    logButtonClick('collection_detail_edit_click', {
      collectionId: numericCollectionId,
    });
  }, [numericCollectionId]);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleEditSubmit = useCallback(
    async (formData: { name: string }) => {
      // Optimistic: close modal immediately
      setIsEditModalOpen(false);

      // Parent's update handler has optimistic updates built-in
      const success = await onCollectionUpdateRequest?.(numericCollectionId, formData.name);
      if (success) {
        toast(t('collection:edit-collection-success'), { status: ToastStatus.Success });
        logButtonClick('collection_edit_success', { collectionId: numericCollectionId });
      } else {
        toast(t('common:error.general'), { status: ToastStatus.Error });
        logButtonClick('collection_edit_failed', { collectionId: numericCollectionId });
      }
    },
    [numericCollectionId, toast, t, onCollectionUpdateRequest],
  );

  const handleDeleteClick = useCallback(() => {
    logButtonClick('collection_detail_delete_click', {
      collectionId: numericCollectionId,
    });
    setIsDeleteModalOpen(true);
  }, [numericCollectionId]);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    logButtonClick('collection_delete_cancel', {
      collectionId: numericCollectionId,
    });
  }, [numericCollectionId]);

  const handleDeleteConfirm = useCallback(async () => {
    logButtonClick('collection_delete_confirm', { collectionId: numericCollectionId });
    if (!onCollectionDeleteRequest) return;

    setIsDeleting(true);
    try {
      const success = await onCollectionDeleteRequest(numericCollectionId);
      if (success) {
        setIsDeleteModalOpen(false);
        toast(t('collection:delete-collection-success'), { status: ToastStatus.Success });
        invalidateAllBookmarkCaches();
      } else {
        toast(t('common:error.general'), { status: ToastStatus.Error });
      }
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    } finally {
      setIsDeleting(false);
    }
  }, [numericCollectionId, onCollectionDeleteRequest, toast, t, invalidateAllBookmarkCaches]);

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
      collectionId: numericCollectionId,
      count: verseKeys.length,
    });
    pinVersesAndSync(verseKeys);
  }, [filteredBookmarks, numericCollectionId, pinVersesAndSync]);

  const handlePinSelectedVerses = useCallback(() => {
    const selected = filteredBookmarks.filter((b) => selectedBookmarks.has(b.id));
    const verseKeys = selected.map((b) => makeVerseKey(b.key, b.verseNumber));
    logButtonClick('collection_detail_pin_selected_verses', {
      collectionId: numericCollectionId,
      count: verseKeys.length,
    });
    pinVersesAndSync(verseKeys);
  }, [filteredBookmarks, selectedBookmarks, numericCollectionId, pinVersesAndSync]);

  const runWithConcurrency = useCallback(
    async <T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> => {
      const results: R[] = [];
      let index = 0;

      const workers = new Array(Math.min(limit, items.length)).fill(null).map(async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const currentIndex = index;
          index += 1;
          if (currentIndex >= items.length) return;
          // eslint-disable-next-line no-await-in-loop
          results[currentIndex] = await mapper(items[currentIndex]);
        }
      });

      await Promise.all(workers);
      return results;
    },
    [],
  );

  const handleBulkCopyClick = useCallback(async () => {
    const selected = filteredBookmarks.filter((b) => selectedBookmarks.has(b.id));
    if (!selected.length) return;

    // Build the blob promise and invoke clipboard copy immediately to preserve user activation.
    const textBlobPromise = (async () => {
      const verseKeys = selected.map((b) => makeVerseKey(b.key, b.verseNumber));
      const texts = await runWithConcurrency(
        verseKeys,
        BULK_ACTIONS_CONCURRENCY_LIMIT,
        async (vk) => {
          const verse = await fetchVerseForCopy(vk, (selectedTranslations as number[]) || []);
          const surahNumber = vk.split(':')[0];
          const chapter = getChapterData(chaptersData, surahNumber);
          const qdcUrl = `${QURAN_URL}${getVerseNavigationUrlByVerseKey(vk)}`;
          return buildVerseCopyText({ verse, chapter, lang, qdcUrl });
        },
      );
      const fullText = texts.join('\n\n');
      return textToBlob(fullText);
    })();

    const copyPromise = copyText(textBlobPromise);

    try {
      await copyPromise;
      toast(`${t('common:copied')}!`, { status: ToastStatus.Success });
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    }
  }, [
    chaptersData,
    filteredBookmarks,
    lang,
    runWithConcurrency,
    selectedBookmarks,
    selectedTranslations,
    t,
    toast,
  ]);

  const handleBulkDeleteClick = useCallback(() => {
    const ids = Array.from(selectedBookmarks);
    if (!ids.length) return;

    setPendingDeleteBookmarkIds(ids);
    setIsDeleteBookmarksModalOpen(true);
  }, [selectedBookmarks]);

  const closeDeleteBookmarksModal = useCallback(() => {
    setIsDeleteBookmarksModalOpen(false);
    setPendingDeleteBookmarkIds([]);
  }, []);

  const handleBulkDeleteModalClose = useCallback(() => {
    if (isDeletingBookmarks) return;
    closeDeleteBookmarksModal();
  }, [closeDeleteBookmarksModal, isDeletingBookmarks]);

  const showDeleteBookmarksSuccessToast = useCallback(
    (count: number) => {
      toast(
        t('collection:delete-bookmark.success', {
          count: toLocalizedNumber(count, lang),
        }),
        { status: ToastStatus.Success },
      );
    },
    [lang, t, toast],
  );

  const clearDeletedBookmarksState = useCallback((deletedIds: string[]) => {
    setSelectedBookmarks(new Set());
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      deletedIds.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    const idsToDelete = pendingDeleteBookmarkIds;
    if (!idsToDelete.length) {
      handleBulkDeleteModalClose();
      return;
    }

    setIsDeletingBookmarks(true);
    try {
      await runWithConcurrency(idsToDelete, BULK_ACTIONS_CONCURRENCY_LIMIT, async (bookmarkId) => {
        await deleteCollectionBookmarkById(numericCollectionId, bookmarkId);
      });

      clearDeletedBookmarksState(idsToDelete);
      onUpdated();
      showDeleteBookmarksSuccessToast(idsToDelete.length);
      closeDeleteBookmarksModal();
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    } finally {
      setIsDeletingBookmarks(false);
    }
  }, [
    clearDeletedBookmarksState,
    closeDeleteBookmarksModal,
    handleBulkDeleteModalClose,
    numericCollectionId,
    onUpdated,
    pendingDeleteBookmarkIds,
    runWithConcurrency,
    showDeleteBookmarksSuccessToast,
    t,
    toast,
  ]);

  const handleShareVerse = useCallback((verseKey: string) => {
    setShareVerseKey(verseKey);
  }, []);

  const handleShareModalClose = useCallback(() => {
    setShareVerseKey(null);
  }, []);

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

  const onItemDeleted = (bookmarkId: string) => {
    deleteCollectionBookmarkById(numericCollectionId, bookmarkId)
      .then(() => {
        onUpdated();
        toast(
          t('collection:delete-bookmark.success', {
            count: toLocalizedNumber(SINGLE_ITEM_COUNT, lang),
          }),
          { status: ToastStatus.Success },
        );
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
          collectionId={numericCollectionId}
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
                onCopyClick={handleBulkCopyClick}
                onDeleteClick={isOwner ? handleBulkDeleteClick : undefined}
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

      <div className={styles.separator} />

      <CollectionDetail
        id={numericCollectionId}
        title={collectionName}
        bookmarks={filteredBookmarks}
        onItemDeleted={onItemDeleted}
        onShareVerse={handleShareVerse}
        isOwner={isOwner}
        onBack={onBack}
        isSelectMode={isSelectMode}
        onToggleBookmarkSelection={handleToggleBookmarkSelection}
        onToggleCardExpansion={handleToggleCardExpansion}
        isCardExpanded={isCardExpanded}
        isBookmarkSelected={isBookmarkSelected}
      />

      <StudyModeContainer />
      <VerseActionModalContainer />
      <ShareQuranModal
        isOpen={!!shareVerseKey}
        onClose={handleShareModalClose}
        verse={shareVerseKey ? { verseKey: shareVerseKey } : undefined}
      />

      <DeleteBookmarkModal
        isOpen={isDeleteBookmarksModalOpen}
        isLoading={isDeletingBookmarks}
        count={pendingDeleteBookmarkIds.length}
        collectionName={collectionName}
        onCancel={handleBulkDeleteModalClose}
        onConfirm={handleBulkDeleteConfirm}
      />

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
