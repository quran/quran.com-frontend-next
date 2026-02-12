import useSWR from 'swr';

import { useAuthContext } from '@/contexts/AuthContext';
import Bookmark from '@/types/Bookmark';
import { getReadingBookmark } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';

/**
 * Generate the SWR cache key for reading bookmark.
 * Use this for consistent cache key across all consumers.
 * @param {number} mushafId - The current mushaf ID
 * @param {string} userId - The user ID (optional, for cache isolation between users)
 * @returns {string} The cache key
 */
export const READING_BOOKMARK_KEY = (mushafId: number, userId?: string) =>
  userId ? `reading-bookmark-${userId}-${mushafId}` : `reading-bookmark-${mushafId}`;

interface UseGlobalReadingBookmarkReturn {
  /** The current reading bookmark, or null if none set */
  readingBookmark: Bookmark | null;
  /** Mutate function to update the cache (use for optimistic updates) */
  mutate: (
    data?: Bookmark | null | Promise<Bookmark | null>,
    opts?: { revalidate?: boolean },
  ) => Promise<Bookmark | null | undefined>;
  /** Whether the data is currently being fetched/validated */
  isLoading: boolean;
  /** Error if fetch failed */
  error: Error | undefined;
}

/**
 * Global singleton hook for reading bookmark.
 *
 * This hook should be used everywhere you need reading bookmark data.
 * It uses SWR's deduplication to ensure only one request is made
 * even when multiple components use this hook simultaneously.
 *
 * Features:
 * - Automatic deduplication (60s window)
 * - Shared cache across all consumers
 * - Optimistic update support via mutate function
 * - Only fetches for logged-in users
 *
 * @param {number} mushafId - The current mushaf ID
 * @returns {UseGlobalReadingBookmarkReturn} Reading bookmark data and controls
 *
 * @example
 * // In any component that needs reading bookmark:
 * const { readingBookmark, mutate } = useGlobalReadingBookmark(mushafId);
 *
 * // To optimistically update after setting a new bookmark:
 * await mutate(newBookmark, { revalidate: true });
 */
const useGlobalReadingBookmark = (mushafId: number): UseGlobalReadingBookmarkReturn => {
  const { state } = useAuthContext();
  const userId = state.user?.id;

  // Generate cache key with user ID to isolate data between users.
  // If userId is undefined (e.g., during auth state transitions),
  // use null as the cache key to prevent data leakage between users.
  const cacheKey = isLoggedIn() && userId ? READING_BOOKMARK_KEY(mushafId, userId) : null;

  const { data, mutate, isValidating, error } = useSWR<Bookmark | null>(
    cacheKey,
    () => getReadingBookmark(mushafId),
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      dedupingInterval: 60000, // 1 minute deduplication window
      revalidateIfStale: true, // Revalidate if data is stale
    },
  );

  return {
    readingBookmark: data ?? null,
    mutate,
    isLoading: isValidating && data === undefined,
    error,
  };
};

export default useGlobalReadingBookmark;
