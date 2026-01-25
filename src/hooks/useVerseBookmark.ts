import { useMemo } from 'react';

import { useSelector, shallowEqual } from 'react-redux';

import useSurahBookmarks from '@/hooks/auth/useSurahBookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Bookmark from '@/types/Bookmark';
import Verse from '@/types/Verse';
import { getMushafId } from '@/utils/api';
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
 * Custom hook to manage verse bookmark fetching and state
 * Encapsulates all bookmark-related data fetching and computed state
 * @param {WordVerse} verse The verse to fetch bookmark data for
 * @returns {UseVerseBookmarkReturn} Bookmark data and loading state
 */
export const useVerseBookmark = (verse: Verse): UseVerseBookmarkReturn => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { getVerseBookmark, isLoading } = useSurahBookmarks(Number(verse.chapterId), mushafId);
  const { verseKey } = verse;
  const loggedIn = isLoggedIn();

  const bookmark = loggedIn ? getVerseBookmark(verseKey) : undefined;

  // Determine if the verse is bookmarked based on user login status
  const isVerseBookmarked = useMemo(() => {
    return loggedIn && !!bookmark;
  }, [bookmark, loggedIn]);

  return {
    bookmark,
    isVerseBookmarked,
    isLoading: loggedIn ? isLoading : false,
  };
};

export default useVerseBookmark;
