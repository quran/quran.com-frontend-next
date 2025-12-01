import { useCallback, useMemo } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { ToastStatus } from '@/components/dls/Toast/Toast';
import useBookmarkBase from '@/hooks/useBookmarkBase';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { privateFetcher } from '@/utils/auth/api';
import Bookmark from 'types/Bookmark';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';

const NOT_BOOKMARKED = null;
type BookmarkCacheValue = Bookmark | null;

/**
 * Minimal verse interface required for bookmark operations
 */
export interface BookmarkableVerse {
  verseKey: string;
  verseNumber: number;
  chapterId: number | string;
}

interface UseVerseBookmarkProps {
  verse: BookmarkableVerse;
  mushafId: number;
  bookmarksRangeUrl?: string;
}

interface UseVerseBookmarkReturn {
  isVerseBookmarked: boolean;
  isLoading: boolean;
  handleToggleBookmark: () => void;
}

/**
 * Custom hook for verse bookmark operations.
 * Uses bulk fetching when bookmarksRangeUrl is provided for efficiency.
 * When bookmarksRangeUrl is not provided for logged-in users, bookmark status won't be fetched from the server.
 * For logged-out users, always uses localStorage bookmarks regardless of bookmarksRangeUrl.
 * @returns {UseVerseBookmarkReturn} Bookmark state and toggle handler
 */
const useVerseBookmark = ({
  verse,
  mushafId,
  bookmarksRangeUrl,
}: UseVerseBookmarkProps): UseVerseBookmarkReturn => {
  const dispatch = useDispatch();
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const { mutate: globalMutate } = useSWRConfig();

  const {
    showToast,
    invalidateBookmarksList,
    handleAddBookmark: baseAddBookmark,
    handleRemoveBookmark: baseRemoveBookmark,
    isLoggedIn,
  } = useBookmarkBase({
    mushafId,
    type: BookmarkType.Ayah,
    key: Number(verse.chapterId),
    verseNumber: verse.verseNumber,
  });

  // Only use bulk fetch when logged in and URL is provided
  const shouldFetchBookmarks = isLoggedIn && !!bookmarksRangeUrl;

  // Fetch page bookmarks (bulk) - SWR deduplicates across all instances
  const { data: pageBookmarks, isValidating: isLoading } = useSWRImmutable<BookmarksMap>(
    shouldFetchBookmarks ? bookmarksRangeUrl : null,
    (url: string) => privateFetcher(url),
  );

  // Extract bookmark for this specific verse
  const bookmark = useMemo(() => {
    return pageBookmarks?.[verse.verseKey] || NOT_BOOKMARKED;
  }, [pageBookmarks, verse.verseKey]);

  const isVerseBookmarked = useMemo(() => {
    if (isLoggedIn) return bookmark !== NOT_BOOKMARKED;
    return !!bookmarkedVerses[verse.verseKey];
  }, [isLoggedIn, bookmarkedVerses, bookmark, verse.verseKey]);

  // Helper: Update bookmark cache
  const updateBookmarkCaches = useCallback(
    (value: BookmarkCacheValue) => {
      if (!bookmarksRangeUrl) return;

      // Update bulk fetch cache
      globalMutate(
        bookmarksRangeUrl,
        (currentData: BookmarksMap | undefined) => {
          if (!currentData) return currentData;
          if (value === null) {
            const newData = { ...currentData };
            delete newData[verse.verseKey];
            return newData;
          }
          return { ...currentData, [verse.verseKey]: value };
        },
        { revalidate: false },
      );
    },
    [globalMutate, bookmarksRangeUrl, verse.verseKey],
  );

  const handleAddBookmark = useCallback(async () => {
    const newBookmark = await baseAddBookmark();
    if (newBookmark) {
      updateBookmarkCaches(newBookmark);
      invalidateBookmarksList();
      showToast('verse-bookmarked', ToastStatus.Success);
    }
  }, [baseAddBookmark, updateBookmarkCaches, invalidateBookmarksList, showToast]);

  const handleRemoveBookmark = useCallback(async () => {
    if (!bookmark || bookmark === NOT_BOOKMARKED) return;
    const success = await baseRemoveBookmark(bookmark.id);
    if (success) {
      updateBookmarkCaches(NOT_BOOKMARKED);
      invalidateBookmarksList();
      showToast('verse-bookmark-removed', ToastStatus.Success);
    }
  }, [bookmark, baseRemoveBookmark, updateBookmarkCaches, invalidateBookmarksList, showToast]);

  const handleLoggedOutToggle = useCallback(() => {
    const wasBookmarked = !!bookmarkedVerses[verse.verseKey];
    dispatch(toggleVerseBookmark(verse.verseKey));
    showToast(wasBookmarked ? 'verse-bookmark-removed' : 'verse-bookmarked', ToastStatus.Success);
  }, [dispatch, verse.verseKey, bookmarkedVerses, showToast]);

  const handleToggleBookmark = useCallback(() => {
    if (isLoggedIn) {
      if (isVerseBookmarked) handleRemoveBookmark();
      else handleAddBookmark();
    } else {
      handleLoggedOutToggle();
    }
  }, [
    isLoggedIn,
    isVerseBookmarked,
    handleRemoveBookmark,
    handleAddBookmark,
    handleLoggedOutToggle,
  ]);

  return {
    isVerseBookmarked,
    isLoading,
    handleToggleBookmark,
  };
};

export default useVerseBookmark;
