import { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { WordVerse } from '@/types/Word';
import { addBookmark, deleteBookmarkById, getBookmark } from '@/utils/auth/api';
import { makeBookmarksUrl, makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import Bookmark from 'types/Bookmark';
import BookmarkType from 'types/BookmarkType';

// Sentinel value to represent "explicitly not bookmarked" vs "no data yet"
const NOT_BOOKMARKED = null;

// Type for bookmark cache value
type BookmarkCacheValue = Bookmark | typeof NOT_BOOKMARKED;

interface UseVerseBookmarkProps {
  verse: WordVerse;
  mushafId: number;
  bookmarksRangeUrl?: string;
}

interface UseVerseBookmarkReturn {
  isVerseBookmarked: boolean;
  isLoading: boolean;
  handleToggleBookmark: () => void;
}

/**
 * Custom hook for verse bookmark operations
 * Handles all logic related to bookmarking verses
 * @param {UseVerseBookmarkProps} props - Hook configuration
 * @param {WordVerse} props.verse - The verse to bookmark
 * @param {number} props.mushafId - The Mushaf ID
 * @param {string} [props.bookmarksRangeUrl] - Optional URL for range bookmarks cache
 * @returns {UseVerseBookmarkReturn} Object containing bookmark state and toggle handler
 */
const useVerseBookmark = ({
  verse,
  mushafId,
  bookmarksRangeUrl,
}: UseVerseBookmarkProps): UseVerseBookmarkReturn => {
  const dispatch = useDispatch();
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
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

  const bookmarkUrl = isLoggedIn()
    ? makeBookmarkUrl(
        mushafId,
        Number(verse.chapterId),
        BookmarkType.Ayah,
        Number(verse.verseNumber),
      )
    : null;

  // Fetch individual bookmark for this verse
  const { data: bookmark, isValidating: isLoading } = useSWRImmutable(bookmarkUrl, async () => {
    const response = await getBookmark(
      mushafId,
      Number(verse.chapterId),
      BookmarkType.Ayah,
      Number(verse.verseNumber),
    );
    return response || NOT_BOOKMARKED;
  });

  // Determine if verse is bookmarked
  const isVerseBookmarked = useMemo(() => {
    const isUserLoggedIn = isLoggedIn();
    if (isUserLoggedIn) {
      return bookmark && bookmark !== NOT_BOOKMARKED;
    }
    return !!bookmarkedVerses[verse.verseKey];
  }, [bookmarkedVerses, bookmark, verse.verseKey]);

  // Helper: Update both individual and range bookmark caches
  const updateBookmarkCaches = useCallback(
    (value: BookmarkCacheValue) => {
      // Update individual bookmark cache
      globalMutate(bookmarkUrl, value, { revalidate: false });

      // Update range cache if available (for translation view)
      if (bookmarksRangeUrl) {
        globalMutate(
          bookmarksRangeUrl,
          (currentData) => {
            if (!currentData) return currentData;
            if (value === null || value === NOT_BOOKMARKED) {
              const newData = { ...currentData };
              delete newData[verse.verseKey];
              return newData;
            }
            return {
              ...currentData,
              [verse.verseKey]: value,
            };
          },
          { revalidate: false },
        );
      }
    },
    [globalMutate, bookmarkUrl, bookmarksRangeUrl, verse.verseKey],
  );

  // Helper: Handle logged-in user bookmark add
  const handleAddBookmark = useCallback(async () => {
    try {
      const newBookmark = await addBookmark({
        key: Number(verse.chapterId),
        mushafId,
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
      });
      updateBookmarkCaches(newBookmark);
      showToast('verse-bookmarked', ToastStatus.Success);
    } catch (err: any) {
      if (err?.status === 400) {
        showToast('common:error.bookmark-sync', ToastStatus.Error);
      } else {
        showToast('error.general', ToastStatus.Error);
      }
    }
  }, [verse.chapterId, verse.verseNumber, mushafId, updateBookmarkCaches, showToast]);

  // Helper: Handle logged-in user bookmark remove
  const handleRemoveBookmark = useCallback(async () => {
    try {
      await deleteBookmarkById(bookmark.id);
      updateBookmarkCaches(NOT_BOOKMARKED);
      showToast('verse-bookmark-removed', ToastStatus.Success);
    } catch {
      showToast('error.general', ToastStatus.Error);
    }
  }, [bookmark, updateBookmarkCaches, showToast]);

  // Helper: Handle logged-out user bookmark toggle
  const handleLoggedOutBookmarkToggle = useCallback(() => {
    dispatch(toggleVerseBookmark(verse.verseKey));
    const wasBookmarked = !!bookmarkedVerses[verse.verseKey];
    const messageKey = wasBookmarked ? 'verse-bookmark-removed' : 'verse-bookmarked';
    showToast(messageKey, ToastStatus.Success);
  }, [dispatch, verse.verseKey, bookmarkedVerses, showToast]);

  // Main toggle handler
  const handleToggleBookmark = useCallback(() => {
    if (isLoggedIn()) {
      invalidateBookmarksList();
      if (isVerseBookmarked) {
        handleRemoveBookmark();
      } else {
        handleAddBookmark();
      }
    } else {
      handleLoggedOutBookmarkToggle();
    }
  }, [
    invalidateBookmarksList,
    isVerseBookmarked,
    handleRemoveBookmark,
    handleAddBookmark,
    handleLoggedOutBookmarkToggle,
  ]);

  return {
    isVerseBookmarked,
    isLoading,
    handleToggleBookmark,
  };
};

export default useVerseBookmark;
