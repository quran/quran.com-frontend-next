import { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import useGlobalReadingBookmark from '@/hooks/auth/useGlobalReadingBookmark';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectBookmarks } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import Word from '@/types/Word';
import { getMushafId } from '@/utils/api';
import { getBookmark, getBookmarkCollections } from '@/utils/auth/api';
import { makeBookmarkCollectionsUrl, makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

interface UseBookmarkStateResult {
  isVerseBookmarked: boolean;
  isVerseBookmarkedLoading: boolean;
  isVerseReadingBookmark: boolean;
  isVerseMultipleBookmarked: boolean;
  mushafId: number;
}

/**
 * Custom hook to manage bookmark state for a verse.
 * Handles both logged-in users (via API) and guests (via Redux).
 *
 * @param {WordVerse} verse - The verse to check bookmark status for
 * @returns {UseBookmarkStateResult} Bookmark state and loading status
 */
const useBookmarkState = (verse: Word): UseBookmarkStateResult => {
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);
  const isGuest = !isLoggedIn();

  // Use global reading bookmark hook (singleton pattern)
  const { readingBookmark, isLoading: isReadingBookmarkLoading } =
    useGlobalReadingBookmark(mushafId);

  // Fetch bookmark for the current verse (logged-in users)
  const { data: bookmark, isValidating: isVerseBookmarkedLoading } = useSWRImmutable(
    !isGuest
      ? makeBookmarkUrl(
          mushafId,
          Number(verse.chapterId),
          BookmarkType.Ayah,
          Number(verse.verseNumber),
        )
      : null,
    async () => {
      const response = await getBookmark(
        mushafId,
        Number(verse.chapterId),
        BookmarkType.Ayah,
        Number(verse.verseNumber),
      );
      return response;
    },
  );

  // For logged-in users, compare readingBookmark with current verse directly
  // For guests, use the guest reading bookmark from Redux
  const isVerseReadingBookmark = useMemo((): boolean => {
    if (isGuest) {
      // Guest: check if guest reading bookmark matches this verse
      if (guestReadingBookmark?.type === BookmarkType.Ayah) {
        return (
          guestReadingBookmark.key === Number(verse.chapterId) &&
          guestReadingBookmark.verseNumber === Number(verse.verseNumber)
        );
      }
      return false;
    }

    // Logged-in: check if reading bookmark matches this verse
    if (readingBookmark && readingBookmark.type === BookmarkType.Ayah) {
      return (
        readingBookmark.key === Number(verse.chapterId) &&
        readingBookmark.verseNumber === Number(verse.verseNumber)
      );
    }

    return false;
  }, [isGuest, guestReadingBookmark, readingBookmark, verse.chapterId, verse.verseNumber]);

  const { data: bookmarkCollectionIdsData, isValidating: isVerseCollectionBookmarkedLoading } =
    useSWRImmutable(
      isLoggedIn() && verse
        ? makeBookmarkCollectionsUrl(
            mushafId,
            Number(verse.chapterId),
            BookmarkType.Ayah,
            Number(verse.verseNumber),
          )
        : null,
      () => {
        if (verse) {
          return getBookmarkCollections(
            mushafId,
            Number(verse.chapterId),
            BookmarkType.Ayah,
            Number(verse.verseNumber),
          );
        }
        return Promise.resolve([]);
      },
    );

  const isVerseBookmarked = useMemo(() => {
    const isUserLoggedIn = !isGuest;
    if (isUserLoggedIn && bookmark) {
      return bookmark?.isInDefaultCollection;
    }
    if (!isUserLoggedIn) {
      return !!bookmarkedVerses[verse.verseKey];
    }
    return false;
  }, [bookmarkedVerses, bookmark, isGuest, verse.verseKey]);

  const isVerseMultipleBookmarked = useMemo(() => {
    return (
      bookmarkCollectionIdsData?.length > 1 ||
      (isVerseBookmarked && bookmarkCollectionIdsData?.length > 0)
    );
  }, [bookmarkCollectionIdsData, isVerseBookmarked]);

  return {
    isVerseBookmarked: isVerseBookmarked || bookmarkCollectionIdsData?.length > 0, // Is any bookmark collections or virtual is set
    isVerseReadingBookmark, // Reading bookmark
    isVerseMultipleBookmarked, // Multiple collections bookmarked
    isVerseBookmarkedLoading:
      isReadingBookmarkLoading || isVerseBookmarkedLoading || isVerseCollectionBookmarkedLoading,
    mushafId,
  };
};

export default useBookmarkState;
