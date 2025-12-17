import { useMemo } from 'react';

import { useSelector, shallowEqual } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { logError } from '@/lib/newrelic';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { WordVerse } from '@/types/Word';
import { getMushafId } from '@/utils/api';
import { getBookmark } from '@/utils/auth/api';
import { makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

interface UseVerseBookmarkReturn {
  /** The bookmark data for the verse, or undefined if not bookmarked */
  bookmark: Bookmark | undefined;
  /** Whether the verse is currently bookmarked by the logged-in user */
  isVerseBookmarked: boolean;
  /** Whether the bookmark data is currently being fetched */
  isLoading: boolean;
}

/**
 * Fetches bookmark for a verse with error handling
 * Returns the bookmark on success, or undefined on error
 * @param {number} mushafId Mushaf ID
 * @param {number} chapterId Chapter ID
 * @param {number} verseNumber Verse number
 * @returns {Promise<Bookmark | undefined>} Bookmark data or undefined if fetch fails
 */
const fetchVerseBookmark = async (
  mushafId: number,
  chapterId: number,
  verseNumber: number,
): Promise<Bookmark | undefined> => {
  try {
    return await getBookmark(mushafId, chapterId, BookmarkType.Ayah, verseNumber);
  } catch (error) {
    logError('Failed to fetch bookmark for verse', error as Error, {
      chapterId,
      verseNumber,
    });
    return undefined;
  }
};

/**
 * Custom hook to manage verse bookmark fetching and state
 * Encapsulates all bookmark-related data fetching and computed state
 * @param {WordVerse} verse The verse to fetch bookmark data for
 * @returns {UseVerseBookmarkReturn} Bookmark data and loading state
 */
export const useVerseBookmark = (verse: WordVerse): UseVerseBookmarkReturn => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  const { data: bookmark, isValidating: isLoading } = useSWRImmutable<Bookmark | undefined>(
    isLoggedIn()
      ? makeBookmarkUrl(
          mushafId,
          Number(verse.chapterId),
          BookmarkType.Ayah,
          Number(verse.verseNumber),
        )
      : null,
    () => fetchVerseBookmark(mushafId, Number(verse.chapterId), Number(verse.verseNumber)),
  );

  // Determine if the verse is bookmarked based on user login status
  const isVerseBookmarked = useMemo(() => {
    return isLoggedIn() && !!bookmark;
  }, [bookmark]);

  return {
    bookmark,
    isVerseBookmarked,
    isLoading,
  };
};

export default useVerseBookmark;
