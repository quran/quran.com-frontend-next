import { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import useGlobalReadingBookmark from '@/hooks/auth/useGlobalReadingBookmark';
import useSurahBookmarks from '@/hooks/auth/useSurahBookmarks';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectBookmarks } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import Verse from '@/types/Verse';
import { getMushafId } from '@/utils/api';
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
 * Handles both logged-in users (via API with surah-level fetching) and guests (via Redux).
 *
 * Uses surah-level bookmark fetching for efficiency - fetches all bookmarks for a surah
 * in a single request instead of individual requests per verse.
 *
 * @param {WordVerse} verse - The verse to check bookmark status for
 * @returns {UseBookmarkStateResult} Bookmark state and loading status
 */
const useBookmarkState = (verse: Verse): UseBookmarkStateResult => {
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);
  const isGuest = !isLoggedIn();

  const { verseKey } = verse;

  // Use global reading bookmark hook (singleton pattern)
  const { readingBookmark, isLoading: isReadingBookmarkLoading } =
    useGlobalReadingBookmark(mushafId);

  // Use surah-level bookmark hook (fetches all bookmarks for the surah once)
  const { getVerseBookmark, isLoading: isSurahBookmarksLoading } = useSurahBookmarks(
    Number(verse.chapterId),
    mushafId,
  );

  // Get bookmark for this specific verse from the surah bookmarks map
  const bookmark = isGuest ? undefined : getVerseBookmark(verseKey);

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

  // Check if verse is bookmarked (in default collection or any collection)
  const isVerseBookmarked = useMemo(() => {
    if (isGuest) {
      return !!bookmarkedVerses[verse.verseKey];
    }
    const count = bookmark?.collectionsCount;
    return count > 0;
  }, [bookmarkedVerses, bookmark, isGuest, verse.verseKey]);

  // Check if verse is in favorites (default collection)
  const isVerseInFavorites = useMemo(() => {
    if (isGuest) {
      return !!bookmarkedVerses[verse.verseKey];
    }
    return !!bookmark?.isInDefaultCollection;
  }, [bookmarkedVerses, bookmark, isGuest, verse.verseKey]);

  const isVerseMultipleBookmarked = useMemo(() => {
    if (isGuest) {
      return false;
    }
    const count = bookmark?.collectionsCount ?? 0;
    return count > 1;
  }, [bookmark, isGuest]);

  return {
    isVerseBookmarked: isVerseBookmarked || isVerseInFavorites, // Is in any collection
    isVerseReadingBookmark, // Reading bookmark
    isVerseMultipleBookmarked, // In collections other than favorites
    isVerseBookmarkedLoading: isReadingBookmarkLoading || isSurahBookmarksLoading,
    mushafId,
  };
};

export default useBookmarkState;
