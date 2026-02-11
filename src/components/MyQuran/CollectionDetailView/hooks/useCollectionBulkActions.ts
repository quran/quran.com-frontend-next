import { useCallback, useMemo, useState } from 'react';

import { ToastFn, TranslateFn } from '../types';

import {
  buildBulkCopyBlobPromise,
  deleteBookmarks,
  showDeleteBookmarksSuccessToast,
} from './bulkActionsUtils';

import { ToastStatus } from '@/dls/Toast/Toast';
import Bookmark from '@/types/Bookmark';
import copyText from '@/utils/copyText';
import ChaptersData from 'types/ChaptersData';

interface UseCollectionBulkActionsParams {
  chaptersData: ChaptersData;
  lang: string;
  t: TranslateFn;
  toast: ToastFn;
  numericCollectionId: string;
  filteredBookmarks: Bookmark[];
  selectedBookmarks: Set<string>;
  selectedTranslations: number[];
  onUpdated: () => void;
  removeBookmarkIdsFromState: (bookmarkIds: string[]) => void;
}

const useCollectionBulkActions = ({
  chaptersData,
  lang,
  t,
  toast,
  numericCollectionId,
  filteredBookmarks,
  selectedBookmarks,
  selectedTranslations,
  onUpdated,
  removeBookmarkIdsFromState,
}: UseCollectionBulkActionsParams) => {
  const [shareVerseKey, setShareVerseKey] = useState<string | null>(null);
  const [isDeleteBookmarksModalOpen, setIsDeleteBookmarksModalOpen] = useState(false);
  const [isDeletingBookmarks, setIsDeletingBookmarks] = useState(false);
  const [pendingDeleteBookmarkIds, setPendingDeleteBookmarkIds] = useState<string[]>([]);

  const selectedBookmarksList = useMemo(
    () => filteredBookmarks.filter((b) => selectedBookmarks.has(b.id)),
    [filteredBookmarks, selectedBookmarks],
  );

  const handleShareVerse = useCallback((verseKey: string) => setShareVerseKey(verseKey), []);
  const handleShareModalClose = useCallback(() => setShareVerseKey(null), []);

  const copyBookmarks = useCallback(
    async (bookmarks: Bookmark[]) => {
      if (!bookmarks.length) return;

      // Invoke clipboard copy immediately to preserve user activation.
      const copyPromise = copyText(
        buildBulkCopyBlobPromise({
          chaptersData,
          lang,
          selectedBookmarks: bookmarks,
          selectedTranslations,
        }),
      );

      try {
        await copyPromise;
        toast(`${t('common:copied')}!`, { status: ToastStatus.Success });
      } catch {
        toast(t('common:error.general'), { status: ToastStatus.Error });
      }
    },
    [chaptersData, lang, selectedTranslations, t, toast],
  );

  const handleBulkCopyClick = useCallback(async () => {
    await copyBookmarks(selectedBookmarksList);
  }, [copyBookmarks, selectedBookmarksList]);

  const handleCopyAllClick = useCallback(async () => {
    await copyBookmarks(filteredBookmarks);
  }, [copyBookmarks, filteredBookmarks]);

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

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteBookmarkIds.length) {
      handleBulkDeleteModalClose();
      return;
    }

    setIsDeletingBookmarks(true);
    try {
      const { deletedIds, failedIds } = await deleteBookmarks({
        numericCollectionId,
        bookmarkIds: pendingDeleteBookmarkIds,
      });

      if (deletedIds.length) {
        removeBookmarkIdsFromState(deletedIds);
        onUpdated();
        showDeleteBookmarksSuccessToast({ toast, t, lang, count: deletedIds.length });
      }

      if (failedIds.length) {
        setPendingDeleteBookmarkIds(failedIds);
        toast(t('common:error.general'), { status: ToastStatus.Error });
        return;
      }

      closeDeleteBookmarksModal();
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    } finally {
      setIsDeletingBookmarks(false);
    }
  }, [
    closeDeleteBookmarksModal,
    handleBulkDeleteModalClose,
    lang,
    numericCollectionId,
    onUpdated,
    pendingDeleteBookmarkIds,
    removeBookmarkIdsFromState,
    t,
    toast,
  ]);

  return {
    shareVerseKey,
    handleShareVerse,
    handleShareModalClose,
    isDeleteBookmarksModalOpen,
    isDeletingBookmarks,
    pendingDeleteBookmarkIds,
    handleBulkCopyClick,
    handleCopyAllClick,
    handleBulkDeleteClick,
    handleBulkDeleteModalClose,
    handleBulkDeleteConfirm,
  };
};

export default useCollectionBulkActions;
