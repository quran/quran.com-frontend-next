import { useMemo } from 'react';

import { useSelector } from 'react-redux';
import useSWR from 'swr';

import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { Mushaf } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { privateFetcher } from '@/utils/auth/api';
import { makeBookmarksUrl } from '@/utils/auth/apiPaths';

export interface RecentlySavedItem {
  id: string;
  surahName?: string;
  surahNameArabic?: string;
  surahNumber: number;
  ayahNumber: number;
  verseKey: string;
}

interface UseRecentlySavedReturn {
  items: RecentlySavedItem[];
  isLoading: boolean;
}

/**
 * Hook to fetch recently saved bookmarks for My Quran page
 * Only works for logged-in users
 * Returns the last 5 ayah bookmarks (most recent first)
 * @returns {UseRecentlySavedReturn} Recently saved items and loading state
 */
const useRecentlySaved = (): UseRecentlySavedReturn => {
  const { isLoggedIn } = useIsLoggedIn();
  const quranReaderStyles = useSelector(selectQuranReaderStyles);

  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines)
    .mushaf as Mushaf;

  // Fetch recently saved bookmarks for logged-in users
  // API returns bookmarks in reverse chronological order by default
  const { data, isValidating } = useSWR<Bookmark[]>(
    isLoggedIn ? makeBookmarksUrl(mushafId, 5, BookmarkType.Ayah) : null,
    () => privateFetcher(makeBookmarksUrl(mushafId, 5, BookmarkType.Ayah)),
    { revalidateOnFocus: false },
  );

  const items = useMemo((): RecentlySavedItem[] => {
    if (!data) return [];

    return data.map((bookmark) => ({
      id: bookmark.id,
      surahNumber: bookmark.key,
      ayahNumber: bookmark.verseNumber || 1,
      verseKey: `${bookmark.key}:${bookmark.verseNumber || 1}`,
    }));
  }, [data]);

  return {
    items,
    isLoading: isLoggedIn ? isValidating && !data : false,
  };
};

export default useRecentlySaved;
