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

  const { data: bookmark, mutate } = useSWR<Bookmark | null>(
    isLoggedIn ? makeBookmarkUrl(mushafId, pageNumber, BookmarkType.Page) : null,
    async () => {
      try {
        const response = await getBookmark(mushafId, pageNumber, BookmarkType.Page);
        // Check if response is an error object (404 returns error body instead of throwing)
        // A valid bookmark must have an id and matching key/type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseAny = response as any;
        if (
          !response ||
          !response.id ||
          responseAny.error ||
          response.type !== BookmarkType.Page ||
          response.key !== pageNumber
        ) {
          return null;
        }
        return response;
      } catch (error) {
        // Return null when bookmark doesn't exist (404) so SWR updates cache properly
        // The API throws the Response object on error
        if (error instanceof Response && error.status === 404) {
          return null;
        }
        // Re-throw other errors so SWR can handle them
        throw error;
      }
    },
    mutatingFetcherConfig,
  );

  // Determine if the page is bookmarked based on user login status and data source
  const isPageBookmarked = useMemo(() => {
    if (isLoggedIn) {
      // Check for valid bookmark that matches the current page
      // - Must have an id (not an error object)
      // - Must match the current page number (not stale data from another page)
      return !!bookmark?.id && bookmark?.key === pageNumber;
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
      mutate(null, { revalidate: true });
      showErrorToast(err);
    } finally {
      isPendingRef.current = false;
    }
  }, [pageNumber, baseAddBookmark, mutate, invalidateBookmarksList, showToast, showErrorToast]);

  const handleBookmarkRemove = useCallback(async () => {
    // Check for valid bookmark with id that matches the current page
    // (not just truthy, as error objects are also truthy, and stale data might be from another page)
    if (isPendingRef.current || !bookmark?.id || bookmark?.key !== pageNumber) return;
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
  }, [
    bookmark,
    baseRemoveBookmark,
    mutate,
    invalidateBookmarksList,
    showToast,
    showErrorToast,
    pageNumber,
  ]);

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
