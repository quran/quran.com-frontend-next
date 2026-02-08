import { useCallback, useMemo } from 'react';

import useSWR from 'swr';

import Bookmark from '@/types/Bookmark';
import BookmarksMap from '@/types/BookmarksMap';
import { getSurahBookmarks } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';

/**
 * Prefix for surah bookmarks cache keys.
 * Use this for cache invalidation filters.
 */
export const SURAH_BOOKMARKS_PREFIX = 'surah-bookmarks-';

/**
 * Generate a stable cache key for surah bookmarks.
 * Format: "surah-bookmarks-{mushafId}-{surahNumber}"
 *
 * @param {number} mushafId - The mushaf ID
 * @param {number} surahNumber - The surah number (1-114)
 * @returns {string} The cache key
 */
export const SURAH_BOOKMARKS_KEY = (mushafId: number, surahNumber: number) =>
  `${SURAH_BOOKMARKS_PREFIX}${mushafId}-${surahNumber}`;

interface UseSurahBookmarksReturn {
  /** Map of all bookmarks in the surah, keyed by verseKey */
  bookmarksMap: BookmarksMap;
  /** Get bookmark for a specific verse */
  getVerseBookmark: (verseKey: string) => Bookmark | undefined;
  /** Check if a specific verse is bookmarked */
  isVerseBookmarked: (verseKey: string) => boolean;
  /** Check if verse is in default collection (favorites) */
  isVerseInFavorites: (verseKey: string) => boolean;
  /** Update a specific verse's bookmark in cache (for optimistic updates) */
  updateVerseBookmark: (verseKey: string, bookmark: Bookmark | undefined) => void;
  /** Mutate function for cache updates */
  mutate: (
    data?: BookmarksMap | Promise<BookmarksMap>,
    opts?: { revalidate?: boolean },
  ) => Promise<BookmarksMap | undefined>;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error if fetch failed */
  error: Error | undefined;
}

/**
 * Global singleton hook for surah-level bookmark fetching.
 *
 * Features:
 * - Fetches ALL bookmarks for a surah in a single request
 * - Caches surah data for the entire session
 * - Automatic deduplication (60s window)
 * - Shared cache across all consumers viewing the same surah
 * - Optimistic update support via updateVerseBookmark
 * - Only fetches for logged-in users
 * - Backend handles mushaf mapping automatically
 *
 * @param {number} surahNumber - The surah number (1-114)
 * @param {number} mushafId - The current mushaf ID
 * @returns {UseSurahBookmarksReturn} Surah bookmarks data and controls
 *
 * @example
 * const { getVerseBookmark, isVerseBookmarked, updateVerseBookmark } = useSurahBookmarks(1, mushafId);
 *
 * // Check if verse is bookmarked
 * const bookmark = getVerseBookmark("1:1");
 *
 * // Optimistically update after adding bookmark
 * updateVerseBookmark("1:1", newBookmark);
 */
const useSurahBookmarks = (surahNumber: number, mushafId: number): UseSurahBookmarksReturn => {
  const { data, mutate, isValidating, error } = useSWR<BookmarksMap>(
    isLoggedIn() && surahNumber ? SURAH_BOOKMARKS_KEY(mushafId, surahNumber) : null,
    () => getSurahBookmarks(mushafId, surahNumber),
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      dedupingInterval: 60000, // 1 minute deduplication window
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  );

  const bookmarksMap = useMemo(() => data ?? {}, [data]);

  const getVerseBookmark = useCallback(
    (verseKey: string): Bookmark | undefined => bookmarksMap[verseKey],
    [bookmarksMap],
  );

  const isVerseBookmarked = useCallback(
    (verseKey: string): boolean => !!bookmarksMap[verseKey],
    [bookmarksMap],
  );

  const isVerseInFavorites = useCallback(
    (verseKey: string): boolean => !!bookmarksMap[verseKey]?.isInDefaultCollection,
    [bookmarksMap],
  );

  const updateVerseBookmark = useCallback(
    (verseKey: string, bookmark: Bookmark | undefined): void => {
      mutate(
        (currentMap) => {
          if (!currentMap) return bookmark ? { [verseKey]: bookmark } : {};

          const newMap = { ...currentMap };
          if (bookmark) {
            newMap[verseKey] = bookmark;
          } else {
            delete newMap[verseKey];
          }
          return newMap;
        },
        { revalidate: false },
      );
    },
    [mutate],
  );

  return {
    bookmarksMap,
    getVerseBookmark,
    isVerseBookmarked,
    isVerseInFavorites,
    updateVerseBookmark,
    mutate,
    isLoading: isValidating && !data,
    error,
  };
};

export default useSurahBookmarks;
