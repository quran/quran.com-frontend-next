import { useCallback, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR, { useSWRConfig } from 'swr';

import { ToastStatus } from '@/components/dls/Toast/Toast';
import useBookmarkBase from '@/hooks/useBookmarkBase';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { privateFetcher } from '@/utils/auth/api';
import mutatingFetcherConfig from '@/utils/swr';
import Bookmark from 'types/Bookmark';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';

const NOT_BOOKMARKED = null;

export interface BookmarkableVerse {
  verseKey: string;
  verseNumber: number;
  chapterId: number | string;
}

const useVerseBookmark = ({
  verse,
  mushafId,
  bookmarksRangeUrl,
}: {
  verse: BookmarkableVerse;
  mushafId: number;
  bookmarksRangeUrl?: string;
}) => {
  const dispatch = useDispatch();
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const { mutate: globalMutate } = useSWRConfig();

  const {
    showToast,
    showErrorToast,
    invalidateBookmarksList,
    addBookmark: baseAddBookmark,
    removeBookmark: baseRemoveBookmark,
    isLoggedIn,
  } = useBookmarkBase({
    mushafId,
    type: BookmarkType.Ayah,
    key: Number(verse.chapterId),
    verseNumber: verse.verseNumber,
  });

  const isPendingRef = useRef(false);

  const { data: pageBookmarks } = useSWR<BookmarksMap>(
    isLoggedIn && bookmarksRangeUrl ? bookmarksRangeUrl : null,
    (url: string) => privateFetcher(url),
    mutatingFetcherConfig,
  );

  const bookmark = pageBookmarks?.[verse.verseKey] || NOT_BOOKMARKED;
  const isVerseBookmarked = isLoggedIn
    ? bookmark !== NOT_BOOKMARKED
    : !!bookmarkedVerses[verse.verseKey];

  const updateBookmarkCaches = useCallback(
    (value: Bookmark | null) => {
      if (!bookmarksRangeUrl) return;
      globalMutate(
        bookmarksRangeUrl,
        (current: BookmarksMap | undefined) => {
          if (!current) return current;
          if (value === null) {
            const d = { ...current };
            delete d[verse.verseKey];
            return d;
          }
          return { ...current, [verse.verseKey]: value };
        },
        { revalidate: false },
      );
    },
    [globalMutate, bookmarksRangeUrl, verse.verseKey],
  );

  const revalidateOnError = useCallback(() => {
    if (bookmarksRangeUrl) globalMutate(bookmarksRangeUrl);
  }, [bookmarksRangeUrl, globalMutate]);

  const handleAddBookmark = useCallback(async () => {
    if (isPendingRef.current) return;
    isPendingRef.current = true;
    const optimisticBookmark: Bookmark = {
      id: `temp-${Date.now()}`,
      key: Number(verse.chapterId),
      type: BookmarkType.Ayah,
      verseNumber: verse.verseNumber,
    };
    updateBookmarkCaches(optimisticBookmark);
    try {
      updateBookmarkCaches(await baseAddBookmark());
      invalidateBookmarksList();
      showToast('verse-bookmarked', ToastStatus.Success);
    } catch (err) {
      updateBookmarkCaches(NOT_BOOKMARKED);
      revalidateOnError();
      showErrorToast(err);
    } finally {
      isPendingRef.current = false;
    }
  }, [
    verse.chapterId,
    verse.verseNumber,
    baseAddBookmark,
    updateBookmarkCaches,
    invalidateBookmarksList,
    showToast,
    showErrorToast,
    revalidateOnError,
  ]);

  const handleRemoveBookmark = useCallback(async () => {
    if (isPendingRef.current || !bookmark || bookmark === NOT_BOOKMARKED) return;
    isPendingRef.current = true;
    const previousBookmark = bookmark;
    updateBookmarkCaches(NOT_BOOKMARKED);
    try {
      await baseRemoveBookmark(previousBookmark.id);
      invalidateBookmarksList();
      showToast('verse-bookmark-removed', ToastStatus.Success);
    } catch (err) {
      updateBookmarkCaches(previousBookmark);
      revalidateOnError();
      showErrorToast(err);
    } finally {
      isPendingRef.current = false;
    }
  }, [
    bookmark,
    baseRemoveBookmark,
    updateBookmarkCaches,
    invalidateBookmarksList,
    showToast,
    showErrorToast,
    revalidateOnError,
  ]);

  const handleToggleBookmark = useCallback(() => {
    if (!isLoggedIn) {
      dispatch(toggleVerseBookmark(verse.verseKey));
      const msg = bookmarkedVerses[verse.verseKey] ? 'verse-bookmark-removed' : 'verse-bookmarked';
      showToast(msg, ToastStatus.Success);
    } else if (isVerseBookmarked) handleRemoveBookmark();
    else handleAddBookmark();
  }, [
    isLoggedIn,
    isVerseBookmarked,
    handleRemoveBookmark,
    handleAddBookmark,
    bookmarkedVerses,
    verse.verseKey,
    dispatch,
    showToast,
  ]);

  return { isVerseBookmarked, handleToggleBookmark };
};

export default useVerseBookmark;
