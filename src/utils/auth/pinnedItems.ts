import { PINNED_ITEMS_CACHE_PATHS } from '@/utils/auth/apiPaths';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import { PinnedItemTargetType, SyncPinnedItemPayload } from 'types/PinnedItem';

/**
 * Check if a SWR cache key matches a pinned items endpoint.
 *
 * @param {unknown} key - The SWR cache key to check.
 * @returns {boolean} Whether the key matches a pinned items endpoint.
 */
export const isPinnedItemsCacheKey = (key: unknown): boolean =>
  typeof key === 'string' && Object.values(PINNED_ITEMS_CACHE_PATHS).some((p) => key.includes(p));

/**
 * Build sync payload for a single verse key.
 *
 * @param {string} verseKey - e.g. "1:2"
 * @param {number} mushafId - The mushaf ID
 * @returns {SyncPinnedItemPayload} Payload ready for syncPinnedItems API
 */
export const buildPinnedSyncPayload = (
  verseKey: string,
  mushafId: number,
): SyncPinnedItemPayload => ({
  targetType: PinnedItemTargetType.Ayah,
  targetId: verseKey,
  metadata: {
    sourceMushafId: mushafId,
    key: getChapterNumberFromKey(verseKey),
    verseNumber: getVerseNumberFromKey(verseKey),
  },
  createdAt: new Date().toISOString(),
});
