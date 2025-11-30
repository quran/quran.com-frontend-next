import { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { WordVerse } from '@/types/Word';
import { addBookmark, deleteBookmarkById, getBookmark } from '@/utils/auth/api';
import { makeBookmarksUrl, makeBookmarkUrl } from '@/utils/auth/apiPaths';
import Bookmark from 'types/Bookmark';
import BookmarkType from 'types/BookmarkType';

const NOT_BOOKMARKED = null;
type BookmarkCacheValue = Bookmark | null;
type BookmarksRangeData = Record<string, Bookmark> | undefined;

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

  const bookmarkUrl = isLoggedIn
    ? makeBookmarkUrl(
        mushafId,
        Number(verse.chapterId),
        BookmarkType.Ayah,
        Number(verse.verseNumber),
      )
    : null;

  const { data: bookmark, isValidating: isLoading } = useSWRImmutable(bookmarkUrl, async () => {
    const response = await getBookmark(
      mushafId,
      Number(verse.chapterId),
      BookmarkType.Ayah,
      Number(verse.verseNumber),
    );
    return response || NOT_BOOKMARKED;
  });

  const isVerseBookmarked = useMemo(() => {
    if (isLoggedIn) return bookmark && bookmark !== NOT_BOOKMARKED;
    return !!bookmarkedVerses[verse.verseKey];
  }, [isLoggedIn, bookmarkedVerses, bookmark, verse.verseKey]);

  const updateBookmarkCaches = useCallback(
    (value: BookmarkCacheValue) => {
      globalMutate(bookmarkUrl, value, { revalidate: false });
      if (bookmarksRangeUrl) {
        globalMutate(
          bookmarksRangeUrl,
          (currentData: BookmarksRangeData) => {
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
      }
    },
    [globalMutate, bookmarkUrl, bookmarksRangeUrl, verse.verseKey],
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
