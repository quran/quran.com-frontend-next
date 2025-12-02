import { useCallback, useMemo } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import { ToastStatus } from '@/components/dls/Toast/Toast';
import useBookmarkBase from '@/hooks/useBookmarkBase';
import { selectBookmarkedPages, togglePageBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { getBookmark } from '@/utils/auth/api';
import { makeBookmarkUrl } from '@/utils/auth/apiPaths';
import Bookmark from 'types/Bookmark';
import BookmarkType from 'types/BookmarkType';

interface UsePageBookmarkProps {
  pageNumber: number;
  mushafId: number;
}

interface UsePageBookmarkReturn {
  isPageBookmarked: boolean;
  isLoading: boolean;
  handleToggleBookmark: () => void;
}

/**
 * Custom hook for page bookmark operations
 * Handles all logic related to bookmarking pages
 *
 * @param {UsePageBookmarkProps} props - Hook configuration
 * @param {number} props.pageNumber - The page number to bookmark
 * @param {number} props.mushafId - The Mushaf ID
 * @returns {UsePageBookmarkReturn} Object containing bookmark state and toggle handler
 */
const usePageBookmark = ({ pageNumber, mushafId }: UsePageBookmarkProps): UsePageBookmarkReturn => {
  const dispatch = useDispatch();
  const bookmarkedPages = useSelector(selectBookmarkedPages, shallowEqual);

  const {
    showToast,
    invalidateBookmarksList,
    handleAddBookmark: baseAddBookmark,
    handleRemoveBookmark: baseRemoveBookmark,
    isLoggedIn,
  } = useBookmarkBase({
    mushafId,
    type: BookmarkType.Page,
    key: pageNumber,
    toastNamespace: 'quran-reader',
  });

  // Use SWR to fetch bookmark data
  // Using useSWR (not useSWRImmutable) because bookmarks can be modified from other pages.
  // revalidateOnFocus enables cross-tab sync, revalidateOnReconnect ensures fresh data after offline.
  const {
    data: bookmark,
    isValidating: isLoading,
    mutate,
  } = useSWR<Bookmark>(
    isLoggedIn ? makeBookmarkUrl(mushafId, pageNumber, BookmarkType.Page) : null,
    async () => {
      const response = await getBookmark(mushafId, pageNumber, BookmarkType.Page);
      return response;
    },
  );

  // Determine if the page is bookmarked based on user login status and data source
  const isPageBookmarked = useMemo(() => {
    if (isLoggedIn) {
      return !!bookmark;
    }
    return !!bookmarkedPages?.[pageNumber.toString()];
  }, [isLoggedIn, bookmarkedPages, bookmark, pageNumber]);

  // Helper: Handle bookmark add for logged-in user
  const handleBookmarkAdd = useCallback(async () => {
    const newBookmark = await baseAddBookmark();
    if (newBookmark) {
      mutate(() => newBookmark, { revalidate: false });
      showToast('page-bookmarked', ToastStatus.Success);
    } else {
      mutate(); // Revalidate to get the correct state on error
    }
  }, [baseAddBookmark, mutate, showToast]);

  // Helper: Handle bookmark removal for logged-in user
  const handleBookmarkRemove = useCallback(async () => {
    if (!bookmark) return;
    mutate(null, { revalidate: false }); // Optimistic update
    const success = await baseRemoveBookmark(bookmark.id);
    if (success) {
      showToast('page-bookmark-removed', ToastStatus.Success);
    } else {
      mutate(); // Revalidate to get the correct state on error
    }
  }, [bookmark, baseRemoveBookmark, mutate, showToast]);

  // Helper: Handle bookmark toggle for logged-out user
  const handleLoggedOutBookmarkToggle = useCallback(() => {
    const wasBookmarked = !!bookmarkedPages?.[pageNumber.toString()];
    dispatch(togglePageBookmark(pageNumber.toString()));
    showToast(wasBookmarked ? 'page-bookmark-removed' : 'page-bookmarked', ToastStatus.Success);
  }, [dispatch, pageNumber, bookmarkedPages, showToast]);

  // Main toggle handler
  const handleToggleBookmark = useCallback(() => {
    if (isLoggedIn) {
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
    isLoggedIn,
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
