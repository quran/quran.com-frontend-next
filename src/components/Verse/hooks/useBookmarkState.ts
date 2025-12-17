import { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { selectBookmarks } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import { WordVerse } from '@/types/Word';
import { getMushafId } from '@/utils/api';
import { getBookmark } from '@/utils/auth/api';
import { makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

interface UseBookmarkStateResult {
  isVerseBookmarked: boolean;
  isVerseBookmarkedLoading: boolean;
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
    isVerseBookmarked,
    isVerseBookmarkedLoading,
    mushafId,
  };
};

export default useBookmarkState;
