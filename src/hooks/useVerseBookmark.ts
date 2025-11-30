import { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { WordVerse } from '@/types/Word';
import { addBookmark, deleteBookmarkById, privateFetcher } from '@/utils/auth/api';
import { makeBookmarksUrl } from '@/utils/auth/apiPaths';
import Bookmark from 'types/Bookmark';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';

const NOT_BOOKMARKED = null;
type BookmarkCacheValue = Bookmark | null;

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
 * Uses bulk fetching when bookmarksRangeUrl is provided for efficiency
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
  const toast = useToast();
  const { t } = useTranslation('common');
  const { isLoggedIn } = useIsLoggedIn();

  const showToast = useCallback(
    (messageKey: string, status: ToastStatus) => toast(t(messageKey), { status }),
    [toast, t],
  );

  const invalidateBookmarksList = useCallback(() => {
    globalMutate(makeBookmarksUrl(mushafId));
  }, [globalMutate, mushafId]);

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
    if (isLoggedIn) return bookmark && bookmark !== NOT_BOOKMARKED;
    return !!bookmarkedVerses[verse.verseKey];
  }, [isLoggedIn, bookmarkedVerses, bookmark, verse.verseKey]);

  // Helper: Update bookmark cache
  const updateBookmarkCaches = useCallback(
    (value: BookmarkCacheValue) => {
      if (!bookmarksRangeUrl) return;

      // Update bulk fetch cache
      globalMutate(
        bookmarksRangeUrl,
        (currentData: BookmarksMap) => {
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
    try {
      const newBookmark = (await addBookmark({
        key: Number(verse.chapterId),
        mushafId,
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
      })) as Bookmark;
      updateBookmarkCaches(newBookmark);
      showToast('verse-bookmarked', ToastStatus.Success);
    } catch (err: unknown) {
      const isBookmarkSyncError =
        err && typeof err === 'object' && 'status' in err && err.status === 400;
      showToast(
        isBookmarkSyncError ? 'common:error.bookmark-sync' : 'error.general',
        ToastStatus.Error,
      );
    }
  }, [verse.chapterId, verse.verseNumber, mushafId, updateBookmarkCaches, showToast]);

  const handleRemoveBookmark = useCallback(async () => {
    if (!bookmark || bookmark === NOT_BOOKMARKED) return;
    try {
      await deleteBookmarkById(bookmark.id);
      updateBookmarkCaches(NOT_BOOKMARKED);
      showToast('verse-bookmark-removed', ToastStatus.Success);
    } catch {
      showToast('error.general', ToastStatus.Error);
    }
  }, [bookmark, updateBookmarkCaches, showToast]);

  const handleLoggedOutToggle = useCallback(() => {
    dispatch(toggleVerseBookmark(verse.verseKey));
    const wasBookmarked = !!bookmarkedVerses[verse.verseKey];
    showToast(wasBookmarked ? 'verse-bookmark-removed' : 'verse-bookmarked', ToastStatus.Success);
  }, [dispatch, verse.verseKey, bookmarkedVerses, showToast]);

  const handleToggleBookmark = useCallback(() => {
    if (isLoggedIn) {
      invalidateBookmarksList();
      if (isVerseBookmarked) handleRemoveBookmark();
      else handleAddBookmark();
    } else {
      handleLoggedOutToggle();
    }
  }, [
    isLoggedIn,
    invalidateBookmarksList,
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
