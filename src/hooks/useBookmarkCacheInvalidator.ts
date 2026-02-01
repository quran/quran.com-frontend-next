import { useCallback } from 'react';

import { useSWRConfig } from 'swr';

import { SURAH_BOOKMARKS_KEY } from '@/hooks/auth/useSurahBookmarks';
import { BOOKMARK_CACHE_PATHS } from '@/utils/auth/apiPaths';

interface BookmarkCacheInvalidator {
  /**
   * Invalidate all bulk bookmark caches used by reader pages.
   * Use this when you don't know which specific page caches need updating
   * (e.g., when deleting from collection detail page).
   */
  invalidateReaderCaches: () => void;

  /**
   * Invalidate all bookmarks list caches (profile page, etc.).
   * Excludes ayahs-range caches to avoid double-invalidation.
   */
  invalidateBookmarksListCaches: () => void;

  /**
   * Invalidate all surah-level bookmark caches.
   * Use this when bookmark data changes and you need to refresh surah bookmarks.
   */
  invalidateSurahCaches: () => void;

  /**
   * Invalidate a specific surah's bookmark cache.
   * Use this for targeted invalidation when you know which surah changed.
   *
   * @param {number} mushafId - The mushaf ID
   * @param {number} surahNumber - The surah number (1-114)
   */
  invalidateSingleSurahCache: (mushafId: number, surahNumber: number) => void;

  /**
   * Invalidate all bookmark-related caches.
   * Combines reader caches, bookmarks list caches, and surah caches.
   */
  invalidateAllBookmarkCaches: () => void;
}

/**
 * Hook providing centralized bookmark cache invalidation functions.
 *
 * Use this hook when you need to invalidate bookmark caches but don't have
 * access to the specific cache keys (e.g., when deleting from collection pages
 * where you don't know which reader pages are cached).
 *
 * For targeted invalidation with known cache keys, prefer using globalMutate
 * directly with the specific URL.
 *
 * @returns {BookmarkCacheInvalidator} Object with cache invalidation functions
 *
 * @example
 * ```tsx
 * const { invalidateAllBookmarkCaches } = useBookmarkCacheInvalidator();
 *
 * const handleDelete = async () => {
 *   await deleteBookmark(id);
 *   invalidateAllBookmarkCaches();
 * };
 * ```
 */
const useBookmarkCacheInvalidator = (): BookmarkCacheInvalidator => {
  const { mutate: globalMutate } = useSWRConfig();

  const invalidateReaderCaches = useCallback(() => {
    // Invalidate bulk bookmark caches (ayahs-range)
    globalMutate(
      (key: string) => typeof key === 'string' && key.includes(BOOKMARK_CACHE_PATHS.AYAHS_RANGE),
      undefined,
      { revalidate: true },
    );
    // Invalidate single bookmark caches (bookmarks/bookmark)
    globalMutate(
      (key: string) => typeof key === 'string' && key.includes(BOOKMARK_CACHE_PATHS.BOOKMARK),
      undefined,
      { revalidate: true },
    );
    // Invalidate bookmark collections caches (which collections a bookmark belongs to)
    globalMutate(
      (key: string) =>
        typeof key === 'string' && key.includes(BOOKMARK_CACHE_PATHS.BOOKMARK_COLLECTIONS),
      undefined,
      { revalidate: true },
    );
  }, [globalMutate]);

  const invalidateBookmarksListCaches = useCallback(() => {
    globalMutate(
      (key: string) =>
        typeof key === 'string' &&
        key.includes(BOOKMARK_CACHE_PATHS.BOOKMARKS_LIST) &&
        !key.includes(BOOKMARK_CACHE_PATHS.AYAHS_RANGE),
      undefined,
      { revalidate: true },
    );
  }, [globalMutate]);

  const invalidateSurahCaches = useCallback(() => {
    // Invalidate all surah bookmark caches (surah-bookmarks-*)
    globalMutate(
      (key: string) => typeof key === 'string' && key.startsWith('surah-bookmarks-'),
      undefined,
      { revalidate: true },
    );
  }, [globalMutate]);

  const invalidateSingleSurahCache = useCallback(
    (mushafId: number, surahNumber: number) => {
      globalMutate(SURAH_BOOKMARKS_KEY(mushafId, surahNumber), undefined, { revalidate: true });
    },
    [globalMutate],
  );

  const invalidateAllBookmarkCaches = useCallback(() => {
    invalidateReaderCaches();
    invalidateBookmarksListCaches();
    invalidateSurahCaches();
  }, [invalidateReaderCaches, invalidateBookmarksListCaches, invalidateSurahCaches]);

  return {
    invalidateReaderCaches,
    invalidateBookmarksListCaches,
    invalidateSurahCaches,
    invalidateSingleSurahCache,
    invalidateAllBookmarkCaches,
  };
};

export default useBookmarkCacheInvalidator;
