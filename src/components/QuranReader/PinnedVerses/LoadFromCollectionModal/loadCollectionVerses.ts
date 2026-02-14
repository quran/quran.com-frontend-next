import { Dispatch } from 'redux';

import { broadcastPinnedVerses, PinnedVersesBroadcastType } from '@/hooks/usePinnedVersesBroadcast';
import { pinVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { privateFetcher, syncPinnedItems } from '@/utils/auth/api';
import { makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { buildPinnedSyncPayload, isPinnedItemsCacheKey } from '@/utils/auth/pinnedItems';
import { makeVerseKey } from '@/utils/verse';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import BookmarkType from 'types/BookmarkType';

/**
 * Fetch bookmarks from a collection and pin them as verses.
 *
 * @param {string} collectionId - The collection to load from.
 * @param {number} mushafId - The current mushaf ID.
 * @param {Dispatch} dispatch - Redux dispatch.
 * @param {Function} globalMutate - SWR global mutate.
 * @returns {Promise<string[]>} The loaded verse keys, or empty array if collection was empty.
 */
const loadCollectionVerses = async (
  collectionId: string,
  mushafId: number,
  dispatch: Dispatch,
  globalMutate: (key: unknown, data?: unknown, opts?: { revalidate: boolean }) => void,
): Promise<string[]> => {
  const collectionData = await privateFetcher<GetBookmarkCollectionsIdResponse>(
    makeGetBookmarkByCollectionId(collectionId, {
      type: BookmarkType.Ayah,
      limit: 10000,
    }),
  );

  const bookmarks = collectionData?.data?.bookmarks || [];
  if (bookmarks.length === 0) return [];

  const verseKeys = bookmarks.map((bookmark) => makeVerseKey(bookmark.key, bookmark.verseNumber));

  dispatch(pinVerses(verseKeys));

  const syncPayload = verseKeys.map((vk) => buildPinnedSyncPayload(vk, mushafId));
  await syncPinnedItems(syncPayload);

  globalMutate(isPinnedItemsCacheKey, undefined, { revalidate: true });

  verseKeys.forEach((vk) => {
    broadcastPinnedVerses(PinnedVersesBroadcastType.PIN, { verseKey: vk });
  });

  return verseKeys;
};

export default loadCollectionVerses;
