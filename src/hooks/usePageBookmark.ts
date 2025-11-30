import { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import { selectBookmarkedPages, togglePageBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { addBookmark, deleteBookmarkById, getBookmark } from '@/utils/auth/api';
import { makeBookmarksUrl, makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import Bookmark from 'types/Bookmark';
import BookmarkType from 'types/BookmarkType';

interface UsePageBookmarkProps {
  pageNumber: number;
  mushafId: number;
}

interface UsePageBookmarkReturn {
  isPageBookmarked: boolean | Bookmark;
  isLoading: boolean;
  handleToggleBookmark: () => void;
}

/**
 * Custom hook for page bookmark operations
 * Handles all logic related to bookmarking pages
 * @param {UsePageBookmarkProps} props - Hook configuration
 * @param {number} props.pageNumber - The page number to bookmark
 * @param {number} props.mushafId - The Mushaf ID
 * @returns {UsePageBookmarkReturn} Object containing bookmark state and toggle handler
 */
const usePageBookmark = ({ pageNumber, mushafId }: UsePageBookmarkProps): UsePageBookmarkReturn => {
  const dispatch = useDispatch();
  const bookmarkedPages = useSelector(selectBookmarkedPages, shallowEqual);
  const { mutate: globalMutate } = useSWRConfig();
  const toast = useToast();
  const { t } = useTranslation('common');

  // Helper: Show toast message
  const showToast = useCallback(
    (messageKey: string, status: ToastStatus) => {
      toast(t(messageKey), { status });
    },
    [toast, t],
  );

  // Helper: Invalidate bookmarks list cache (for /collections/all page)
  const invalidateBookmarksList = useCallback(() => {
    globalMutate(makeBookmarksUrl(mushafId));
  }, [globalMutate, mushafId]);

  // Use SWR to fetch bookmark data
  const {
    data: bookmark,
    isValidating: isLoading,
    mutate,
  } = useSWRImmutable<Bookmark>(
    isLoggedIn() ? makeBookmarkUrl(mushafId, Number(pageNumber), BookmarkType.Page) : null,
    async () => {
      const response = await getBookmark(mushafId, Number(pageNumber), BookmarkType.Page);
      return response;
    },
  );

  // Determine if the page is bookmarked based on user login status and data source
  const isPageBookmarked = useMemo(() => {
    const isUserLoggedIn = isLoggedIn();
    if (isUserLoggedIn && bookmark) {
      return bookmark;
    }
    if (!isUserLoggedIn) {
      return !!bookmarkedPages?.[pageNumber.toString()];
    }
    return false;
  }, [bookmarkedPages, bookmark, pageNumber]);

  // Helper: Handle bookmark add for logged-in user
  const handleBookmarkAdd = useCallback(async () => {
    try {
      const response = await addBookmark({
        key: Number(pageNumber),
        mushafId,
        type: BookmarkType.Page,
      });
      mutate(() => response as Bookmark, { revalidate: false });
      showToast('quran-reader:page-bookmarked', ToastStatus.Success);
    } catch {
      mutate(); // Revalidate to get the correct state
      showToast('common:error.general', ToastStatus.Error);
    }
  }, [pageNumber, mushafId, mutate, showToast]);

  // Helper: Handle bookmark removal for logged-in user
  const handleBookmarkRemove = useCallback(async () => {
    if (!bookmark) return;
    try {
      mutate(null, { revalidate: false }); // Optimistic update
      await deleteBookmarkById(bookmark.id);
      showToast('quran-reader:page-bookmark-removed', ToastStatus.Success);
    } catch {
      mutate(); // Revalidate to get the correct state
      showToast('common:error.general', ToastStatus.Error);
    }
  }, [bookmark, mutate, showToast]);

  // Helper: Handle bookmark toggle for logged-out user
  const handleLoggedOutBookmarkToggle = useCallback(() => {
    dispatch(togglePageBookmark(pageNumber.toString()));
    const wasBookmarked = !!bookmarkedPages?.[pageNumber.toString()];
    const messageKey = wasBookmarked
      ? 'quran-reader:page-bookmark-removed'
      : 'quran-reader:page-bookmarked';
    showToast(messageKey, ToastStatus.Success);
  }, [dispatch, pageNumber, bookmarkedPages, showToast]);

  // Main toggle handler
  const handleToggleBookmark = useCallback(() => {
    if (isLoggedIn()) {
      invalidateBookmarksList();
      if (isPageBookmarked) {
        handleBookmarkRemove();
      } else {
        handleBookmarkAdd();
      }
    } else {
      handleLoggedOutBookmarkToggle();
    }
  }, [
    invalidateBookmarksList,
    isPageBookmarked,
    handleBookmarkRemove,
    handleBookmarkAdd,
    handleLoggedOutBookmarkToggle,
  ]);

  return {
    isPageBookmarked,
    isLoading,
    handleToggleBookmark,
  };
};

export default usePageBookmark;
