import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { addBookmark, deleteBookmarkById } from '@/utils/auth/api';
import { makeBookmarksUrl } from '@/utils/auth/apiPaths';
import { isBookmarkSyncError } from '@/utils/auth/errors';
import Bookmark from 'types/Bookmark';
import BookmarkType from 'types/BookmarkType';

export interface BookmarkBaseConfig {
  mushafId: number;
  type: BookmarkType;
  key: number;
  verseNumber?: number;
  toastNamespace?: string;
}

export interface BookmarkBaseReturn {
  showToast: (messageKey: string, status: ToastStatus) => void;
  invalidateBookmarksList: () => void;
  handleAddBookmark: () => Promise<Bookmark | null>;
  handleRemoveBookmark: (bookmarkId: string) => Promise<boolean>;
  isLoggedIn: boolean;
}

/**
 * Base hook providing shared bookmark functionality for verse and page bookmarks.
 * Handles common operations like toast notifications, cache invalidation, and API calls.
 *
 * @param {BookmarkBaseConfig} config - Configuration for the bookmark base hook
 * @returns {BookmarkBaseReturn} Shared bookmark utilities and state
 */
const useBookmarkBase = ({
  mushafId,
  type,
  key,
  verseNumber,
  toastNamespace = 'common',
}: BookmarkBaseConfig): BookmarkBaseReturn => {
  const { mutate: globalMutate } = useSWRConfig();
  const toast = useToast();
  const { t } = useTranslation(toastNamespace);
  const { isLoggedIn } = useIsLoggedIn();

  const showToast = useCallback(
    (messageKey: string, status: ToastStatus) => {
      toast(t(messageKey), { status });
    },
    [toast, t],
  );

  const invalidateBookmarksList = useCallback(() => {
    globalMutate(makeBookmarksUrl(mushafId));
  }, [globalMutate, mushafId]);

  const handleAddBookmark = useCallback(async (): Promise<Bookmark | null> => {
    try {
      const newBookmark = (await addBookmark({
        key,
        mushafId,
        type,
        verseNumber,
      })) as Bookmark;
      return newBookmark;
    } catch (err: unknown) {
      showToast(
        isBookmarkSyncError(err) ? 'common:error.bookmark-sync' : 'common:error.general',
        ToastStatus.Error,
      );
      return null;
    }
  }, [key, mushafId, type, verseNumber, showToast]);

  const handleRemoveBookmark = useCallback(
    async (bookmarkId: string): Promise<boolean> => {
      try {
        await deleteBookmarkById(bookmarkId);
        return true;
      } catch (err: unknown) {
        showToast(
          isBookmarkSyncError(err) ? 'common:error.bookmark-sync' : 'common:error.general',
          ToastStatus.Error,
        );
        return false;
      }
    },
    [showToast],
  );

  return {
    showToast,
    invalidateBookmarksList,
    handleAddBookmark,
    handleRemoveBookmark,
    isLoggedIn,
  };
};

export default useBookmarkBase;
