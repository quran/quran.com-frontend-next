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
  showErrorToast: (err: unknown) => void;
  invalidateBookmarksList: () => void;
  addBookmark: () => Promise<Bookmark>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
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

  const showErrorToast = useCallback(
    (err: unknown) => {
      const messageKey = isBookmarkSyncError(err) ? 'error.bookmark-sync' : 'error.general';
      toast(t(`common:${messageKey}`), { status: ToastStatus.Error });
    },
    [toast, t],
  );

  const invalidateBookmarksList = useCallback(() => {
    globalMutate(makeBookmarksUrl(mushafId));
  }, [globalMutate, mushafId]);

  const baseAddBookmark = useCallback(
    async (): Promise<Bookmark> => addBookmark({ key, mushafId, type, verseNumber }),
    [key, mushafId, type, verseNumber],
  );

  const baseRemoveBookmark = useCallback(async (bookmarkId: string): Promise<void> => {
    await deleteBookmarkById(bookmarkId);
  }, []);

  return {
    showToast,
    showErrorToast,
    invalidateBookmarksList,
    addBookmark: baseAddBookmark,
    removeBookmark: baseRemoveBookmark,
    isLoggedIn,
  };
};

export default useBookmarkBase;
