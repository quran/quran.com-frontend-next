import { useCallback, useMemo, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import { ToastStatus } from '@/components/dls/Toast/Toast';
import useBookmarkBase from '@/hooks/useBookmarkBase';
import { selectBookmarkedPages, togglePageBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { getBookmark } from '@/utils/auth/api';
import { makeBookmarkUrl } from '@/utils/auth/apiPaths';
import mutatingFetcherConfig from '@/utils/swr';
import Bookmark from 'types/Bookmark';
import BookmarkType from 'types/BookmarkType';

interface UsePageBookmarkProps {
  pageNumber: number;
  mushafId: number;
}

interface UsePageBookmarkReturn {
  isPageBookmarked: boolean;
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
    showErrorToast,
    invalidateBookmarksList,
    addBookmark: baseAddBookmark,
    removeBookmark: baseRemoveBookmark,
    isLoggedIn,
  } = useBookmarkBase({
    mushafId,
    type: BookmarkType.Page,
    key: pageNumber,
    toastNamespace: 'quran-reader',
  });

  const isPendingRef = useRef(false);

  const { data: bookmark, mutate } = useSWR<Bookmark>(
    isLoggedIn ? makeBookmarkUrl(mushafId, pageNumber, BookmarkType.Page) : null,
    async () => {
      const response = await getBookmark(mushafId, pageNumber, BookmarkType.Page);
      return response;
    },
    mutatingFetcherConfig,
  );

  // Determine if the page is bookmarked based on user login status and data source
  const isPageBookmarked = useMemo(() => {
    if (isLoggedIn) {
      return !!bookmark;
    }
    return !!bookmarkedPages?.[pageNumber.toString()];
  }, [isLoggedIn, bookmarkedPages, bookmark, pageNumber]);

  const handleBookmarkAdd = useCallback(async () => {
    if (isPendingRef.current) return;
    isPendingRef.current = true;
    const optimisticBookmark: Bookmark = {
      id: `temp-${Date.now()}`,
      key: pageNumber,
      type: BookmarkType.Page,
    };
    mutate(optimisticBookmark, { revalidate: false });
    try {
      mutate(await baseAddBookmark(), { revalidate: false });
      invalidateBookmarksList();
      showToast('page-bookmarked', ToastStatus.Success);
    } catch (err) {
      mutate(undefined, { revalidate: true });
      showErrorToast(err);
    } finally {
      isPendingRef.current = false;
    }
  }, [pageNumber, baseAddBookmark, mutate, invalidateBookmarksList, showToast, showErrorToast]);

  const handleBookmarkRemove = useCallback(async () => {
    if (isPendingRef.current || !bookmark) return;
    isPendingRef.current = true;
    const previousBookmark = bookmark;
    mutate(null, { revalidate: false });
    try {
      await baseRemoveBookmark(previousBookmark.id);
      invalidateBookmarksList();
      showToast('page-bookmark-removed', ToastStatus.Success);
    } catch (err) {
      mutate(previousBookmark, { revalidate: true });
      showErrorToast(err);
    } finally {
      isPendingRef.current = false;
    }
  }, [bookmark, baseRemoveBookmark, mutate, invalidateBookmarksList, showToast, showErrorToast]);

  // Helper: Handle bookmark toggle for logged-out user
  const handleLoggedOutBookmarkToggle = useCallback(() => {
    const wasBookmarked = !!bookmarkedPages?.[pageNumber.toString()];
    dispatch(togglePageBookmark(pageNumber.toString()));
    showToast(wasBookmarked ? 'page-bookmark-removed' : 'page-bookmarked', ToastStatus.Success);
  }, [dispatch, pageNumber, bookmarkedPages, showToast]);

  const handleToggleBookmark = useCallback(() => {
    if (isLoggedIn) {
      if (isPageBookmarked) handleBookmarkRemove();
      else handleBookmarkAdd();
    } else {
      handleLoggedOutBookmarkToggle();
    }
  }, [
    isLoggedIn,
    isPageBookmarked,
    handleBookmarkRemove,
    handleBookmarkAdd,
    handleLoggedOutBookmarkToggle,
  ]);

  return { isPageBookmarked, handleToggleBookmark };
};

export default usePageBookmark;
