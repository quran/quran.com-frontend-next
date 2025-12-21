import { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectBookmarks } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import { WordVerse } from '@/types/Word';
import { getMushafId } from '@/utils/api';
import { getBookmark, getBookmarkCollections, getUserPreferences } from '@/utils/auth/api';
import {
  makeBookmarkCollectionsUrl,
  makeBookmarkUrl,
  makeUserPreferencesUrl,
} from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { parseReadingBookmark } from '@/utils/bookmark';

interface UseBookmarkStateResult {
  isVerseBookmarked: boolean;
  isVerseBookmarkedLoading: boolean;
  isVerseReadingBookmark: boolean;
  isVerseCollectionBookmarked: boolean;
  mushafId: number;
}

/**
 * Custom hook to manage bookmark state for a verse.
 * Handles both logged-in users (via API) and guests (via Redux).
 *
 * @param {WordVerse} verse - The verse to check bookmark status for
 * @returns {UseBookmarkStateResult} Bookmark state and loading status
 */
const useBookmarkState = (verse: WordVerse): UseBookmarkStateResult => {
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);
  const isGuest = !isLoggedIn();

  // Fetch user preferences for reading bookmark (logged-in users)
  const { data: userPreferences, isValidating: isReadingBookmarkLoading } = useSWR(
    !isGuest ? makeUserPreferencesUrl() : null,
    getUserPreferences,
  );

  const readingBookmark = isGuest
    ? guestReadingBookmark
    : (userPreferences?.readingBookmark?.bookmark as string);

  const isVerseReadingBookmark = useMemo((): boolean => {
    if (readingBookmark?.startsWith?.(BookmarkType.Ayah)) {
      const { surahNumber, verseNumber } = parseReadingBookmark(readingBookmark);
      return surahNumber === Number(verse.chapterId) && verseNumber === Number(verse.verseNumber);
    }

    return false;
  }, [readingBookmark, verse]);

  const { data: bookmark, isValidating: isVerseBookmarkedLoading } = useSWRImmutable(
    isLoggedIn()
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
    const isUserLoggedIn = isLoggedIn();
    if (isUserLoggedIn && bookmark) {
      return !!bookmark;
    }
    if (!isUserLoggedIn) {
      return !!bookmarkedVerses[verse.verseKey];
    }
    return false;
  }, [bookmarkedVerses, bookmark, verse.verseKey]);

  return {
    isVerseBookmarked, // Virtual Favorite collection
    isVerseReadingBookmark, // Reading bookmark
    isVerseCollectionBookmarked: bookmarkCollectionIdsData?.length > 0, // Other collections
    isVerseBookmarkedLoading:
      isReadingBookmarkLoading || isVerseBookmarkedLoading || isVerseCollectionBookmarkedLoading,
    mushafId,
  };
};

export default useBookmarkState;
