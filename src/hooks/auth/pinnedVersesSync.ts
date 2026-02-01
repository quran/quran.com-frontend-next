import { Dispatch } from 'redux';

import { logErrorToSentry } from '@/lib/sentry';
import {
  PinnedVerse,
  setPinnedVerses,
  setServerIds,
} from '@/redux/slices/QuranReader/pinnedVerses';
import { getPinnedItems, syncPinnedItems } from '@/utils/auth/api';
import { getLastSyncAt } from '@/utils/auth/userDataSync';
import { getVerseNumberFromKey, getChapterNumberFromKey } from '@/utils/verse';
import { PinnedItemTargetType, SyncPinnedItemPayload, PinnedItemDTO } from 'types/PinnedItem';

const MAX_SYNC_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const POLL_INTERVAL_MS = 500;
const MAX_POLL_ATTEMPTS = 20;

/**
 * Convert a server PinnedItemDTO to a local PinnedVerse.
 *
 * @param {PinnedItemDTO} item - The server item to convert.
 * @returns {PinnedVerse} The converted local PinnedVerse.
 */
export const serverItemToLocal = (item: PinnedItemDTO): PinnedVerse => ({
  verseKey: item.targetId,
  chapterNumber: (item.metadata?.chapterNumber as number) || getChapterNumberFromKey(item.targetId),
  verseNumber: (item.metadata?.verseNumber as number) || getVerseNumberFromKey(item.targetId),
  timestamp: new Date(item.createdAt).getTime(),
  serverId: item.id,
});

/**
 * Convert a local PinnedVerse to a sync payload with metadata.
 *
 * @param {PinnedVerse} verse - The local verse.
 * @param {number} mushafId - The mushaf ID.
 * @returns {SyncPinnedItemPayload} The sync payload.
 */
export const localToSyncPayload = (
  verse: PinnedVerse,
  mushafId: number,
): SyncPinnedItemPayload => ({
  targetType: PinnedItemTargetType.Ayah,
  targetId: verse.verseKey,
  metadata: {
    sourceMushafId: mushafId,
    key: verse.chapterNumber,
    verseNumber: verse.verseNumber,
  },
  createdAt: new Date(verse.timestamp).toISOString(),
});

/**
 * Wait for useSyncUserData to complete (indicated by lastSyncAt cookie being set).
 *
 * @returns {Promise<boolean>} true if lastSyncAt was found, false if timed out.
 */
export const waitForMainSync = (): Promise<boolean> =>
  new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      if (getLastSyncAt()) {
        resolve(true);
        return;
      }
      attempts += 1;
      if (attempts >= MAX_POLL_ATTEMPTS) {
        resolve(false);
        return;
      }
      setTimeout(check, POLL_INTERVAL_MS);
    };
    check();
  });

/**
 * Merge server and local pinned verses, deduplicating by verse key.
 *
 * @param {PinnedItemDTO[]} serverItems - Items from the server.
 * @param {PinnedVerse[]} localPinned - Local pinned verses.
 * @returns {PinnedVerse[]} Merged and sorted list.
 */
const mergePinnedVerses = (
  serverItems: PinnedItemDTO[],
  localPinned: PinnedVerse[],
): PinnedVerse[] => {
  const localMap = new Map<string, PinnedVerse>();
  localPinned.forEach((v: PinnedVerse) => localMap.set(v.verseKey, v));

  const merged: PinnedVerse[] = [];
  const seenKeys = new Set<string>();

  serverItems.forEach((item) => {
    seenKeys.add(item.targetId);
    const localVerse = localMap.get(item.targetId);
    merged.push({
      ...serverItemToLocal(item),
      timestamp: localVerse?.timestamp || new Date(item.createdAt).getTime(),
    });
  });

  localPinned.forEach((v: PinnedVerse) => {
    if (!seenKeys.has(v.verseKey)) {
      merged.push(v);
    }
  });

  merged.sort((a, b) => a.timestamp - b.timestamp);
  return merged;
};

/**
 * Build server ID mapping from server items.
 *
 * @param {PinnedItemDTO[]} serverItems - Items from the server.
 * @returns {Record<string, string>} Mapping of targetId to server id.
 */
const buildServerIdMapping = (serverItems: PinnedItemDTO[]): Record<string, string> => {
  const idMapping: Record<string, string> = {};
  serverItems.forEach((item) => {
    idMapping[item.targetId] = item.id;
  });
  return idMapping;
};

/**
 * Merge local and server pinned verses, push local-only to server, and dispatch to Redux.
 *
 * @param {PinnedVerse[]} localPinned - Current local pinned verses.
 * @param {number} mushafId - The mushaf ID.
 * @param {Dispatch} dispatch - Redux dispatch function.
 * @returns {Promise<void>}
 */
export const mergeAndSyncPinnedVerses = async (
  localPinned: PinnedVerse[],
  mushafId: number,
  dispatch: Dispatch,
): Promise<void> => {
  const { data: serverItems } = await getPinnedItems(PinnedItemTargetType.Ayah);

  const serverMap = new Map<string, PinnedItemDTO>();
  serverItems.forEach((item) => serverMap.set(item.targetId, item));

  const localOnlyItems: SyncPinnedItemPayload[] = localPinned
    .filter((v: PinnedVerse) => !serverMap.has(v.verseKey))
    .map((v: PinnedVerse) => localToSyncPayload(v, mushafId));

  if (localOnlyItems.length > 0) {
    await syncPinnedItems(localOnlyItems);
  }

  dispatch(setPinnedVerses(mergePinnedVerses(serverItems, localPinned)));

  const idMapping = buildServerIdMapping(serverItems);
  if (Object.keys(idMapping).length > 0) {
    dispatch(setServerIds(idMapping));
  }
};

interface PerformPinnedSyncParams {
  localPinnedRef: { current: PinnedVerse[] };
  mushafIdRef: { current: number };
  dispatch: Dispatch;
  hasSyncedRef: { current: boolean };
  retryTimeoutRef: { current: NodeJS.Timeout | null };
  attempt?: number;
}

/**
 * Perform the sync operation with retry logic.
 *
 * @param {PerformPinnedSyncParams} params - The sync parameters containing refs and dispatch.
 * @returns {Promise<void>}
 */
export const performPinnedSync = async (params: PerformPinnedSyncParams): Promise<void> => {
  const { localPinnedRef, mushafIdRef, dispatch, hasSyncedRef, retryTimeoutRef } = params;
  const attempt = params.attempt || 0;

  const mainSyncDone = await waitForMainSync();
  if (!mainSyncDone) return;

  try {
    await mergeAndSyncPinnedVerses(localPinnedRef.current, mushafIdRef.current, dispatch);
    hasSyncedRef.current = true;
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'useSyncPinnedVerses',
      metadata: {
        pinnedCount: localPinnedRef.current.length,
        mushafId: mushafIdRef.current,
        attempt,
      },
    });
    if (attempt < MAX_SYNC_ATTEMPTS - 1) {
      const delay = INITIAL_RETRY_DELAY_MS * 2 ** attempt;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(
        () => performPinnedSync({ ...params, attempt: attempt + 1 }),
        delay,
      );
    }
  }
};
