import { useCallback, useRef, useState } from 'react';

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
  /** Chapter ID - accepts both number and string since route params come as strings */
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
  const [optimisticBookmark, setOptimisticBookmark] = useState<Bookmark | null>();
  const { data: pageBookmarks } = useSWR<BookmarksMap>(
    isLoggedIn && bookmarksRangeUrl ? bookmarksRangeUrl : null,
    (url: string) => privateFetcher(url),
    mutatingFetcherConfig,
  );
  const effectiveBookmark = optimisticBookmark ?? pageBookmarks?.[verse.verseKey] ?? null;
  const isVerseBookmarked = isLoggedIn
    ? effectiveBookmark !== null
    : !!bookmarkedVerses[verse.verseKey];
  const updateBookmarkCaches = useCallback(
    (value: Bookmark | null) => {
      if (!bookmarksRangeUrl) {
        setOptimisticBookmark(value);
        return;
      }
      globalMutate(
        bookmarksRangeUrl,
        (current: BookmarksMap | undefined) => {
          if (!current) return value === null ? {} : { [verse.verseKey]: value };
          if (value === null) {
            const { [verse.verseKey]: removed, ...rest } = current; // eslint-disable-line @typescript-eslint/no-unused-vars
            return rest;
          }
          return { ...current, [verse.verseKey]: value };
        },
        { revalidate: false },
      );
    },
    [globalMutate, bookmarksRangeUrl, verse.verseKey],
  );
  const handleAddBookmark = useCallback(async () => {
    if (isPendingRef.current) return;
    isPendingRef.current = true;
    updateBookmarkCaches({
      id: `temp-${Date.now()}`,
      key: Number(verse.chapterId),
      type: BookmarkType.Ayah,
      verseNumber: verse.verseNumber,
    });
    try {
      updateBookmarkCaches(await baseAddBookmark());
      invalidateBookmarksList();
      showToast('verse-bookmarked', ToastStatus.Success);
    } catch (err) {
      updateBookmarkCaches(NOT_BOOKMARKED);
      if (bookmarksRangeUrl) globalMutate(bookmarksRangeUrl);
      showErrorToast(err);
    } finally {
      isPendingRef.current = false;
    }
  }, [
    verse,
    baseAddBookmark,
    updateBookmarkCaches,
    invalidateBookmarksList,
    showToast,
    showErrorToast,
    bookmarksRangeUrl,
    globalMutate,
  ]);
  const handleRemoveBookmark = useCallback(async () => {
    if (isPendingRef.current || !effectiveBookmark) return;
    isPendingRef.current = true;
    const prev = effectiveBookmark;
    updateBookmarkCaches(NOT_BOOKMARKED);
    try {
      await baseRemoveBookmark(prev.id);
      invalidateBookmarksList();
      showToast('verse-bookmark-removed', ToastStatus.Success);
    } catch (err) {
      updateBookmarkCaches(prev);
      if (bookmarksRangeUrl) globalMutate(bookmarksRangeUrl);
      showErrorToast(err);
    } finally {
      isPendingRef.current = false;
    }
  }, [
    effectiveBookmark,
    baseRemoveBookmark,
    updateBookmarkCaches,
    invalidateBookmarksList,
    showToast,
    showErrorToast,
    bookmarksRangeUrl,
    globalMutate,
  ]);
  const handleToggleBookmark = useCallback(() => {
    if (!isLoggedIn) {
      const wasBookmarked = !!bookmarkedVerses[verse.verseKey];
      dispatch(toggleVerseBookmark(verse.verseKey));
      showToast(wasBookmarked ? 'verse-bookmark-removed' : 'verse-bookmarked', ToastStatus.Success);
    } else if (isVerseBookmarked) handleRemoveBookmark();
    else handleAddBookmark();
  }, [
    isLoggedIn,
    isVerseBookmarked,
    handleRemoveBookmark,
    handleAddBookmark,
    bookmarkedVerses,
    verse,
    dispatch,
    showToast,
  ]);
  return { isVerseBookmarked, handleToggleBookmark };
};

export default useVerseBookmark;
