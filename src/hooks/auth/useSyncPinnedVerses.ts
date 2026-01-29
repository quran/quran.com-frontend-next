import { useEffect, useCallback, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { logErrorToSentry } from '@/lib/sentry';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import {
  PinnedVerse,
  selectPinnedVerses,
  setPinnedVerses,
  setServerIds,
} from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { getPinnedItems, syncPinnedItems } from '@/utils/auth/api';
import { getVerseNumberFromKey, getChapterNumberFromKey } from '@/utils/verse';
import { SyncPinnedItemPayload } from 'types/auth/SyncDataType';
import { PinnedItemDTO } from 'types/PinnedItem';

const MAX_SYNC_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

/**
 * Convert a server PinnedItemDTO to a local PinnedVerse.
 */
const serverItemToLocal = (item: PinnedItemDTO): PinnedVerse => ({
  verseKey: item.targetId,
  chapterNumber:
    (item.metadata?.chapterNumber as number) || getChapterNumberFromKey(item.targetId),
  verseNumber: (item.metadata?.verseNumber as number) || getVerseNumberFromKey(item.targetId),
  timestamp: new Date(item.createdAt).getTime(),
  serverId: item.id,
});

/**
 * Convert a local PinnedVerse to a sync payload.
 */
const localToSyncPayload = (
  verse: PinnedVerse,
  mushafId: number,
): SyncPinnedItemPayload => ({
  targetType: 'ayah',
  targetId: verse.verseKey,
  metadata: {
    sourceMushafId: mushafId,
    chapterNumber: verse.chapterNumber,
    verseNumber: verse.verseNumber,
  },
  createdAt: new Date(verse.timestamp).toISOString(),
});

/**
 * Syncs pinned verses with the backend on login.
 * Bidirectional merge: server-only items are added locally, local-only items are pushed to server.
 */
const useSyncPinnedVerses = () => {
  const dispatch = useDispatch();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  const hasSyncedRef = useRef(false);
  const { isLoggedIn } = useIsLoggedIn();
  const isPersistGateHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);
  const localPinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  const performSync = useCallback(
    async (attempt = 0): Promise<void> => {
      try {
        // 1. Fetch server pinned items
        const { data: serverItems } = await getPinnedItems('ayah');

        const serverMap = new Map<string, PinnedItemDTO>();
        serverItems.forEach((item) => serverMap.set(item.targetId, item));

        const localMap = new Map<string, PinnedVerse>();
        localPinnedVerses.forEach((v) => localMap.set(v.verseKey, v));

        // 2. Find local-only items to push to server
        const localOnlyItems: SyncPinnedItemPayload[] = [];
        localPinnedVerses.forEach((v) => {
          if (!serverMap.has(v.verseKey)) {
            localOnlyItems.push(localToSyncPayload(v, mushafId));
          }
        });

        // 3. Push local-only items to server
        if (localOnlyItems.length > 0) {
          await syncPinnedItems(localOnlyItems);
        }

        // 4. Merge: build final list (server is source of truth for serverId)
        const merged: PinnedVerse[] = [];
        const seenKeys = new Set<string>();

        // Add all server items (source of truth for serverId)
        serverItems.forEach((item) => {
          seenKeys.add(item.targetId);
          const localVerse = localMap.get(item.targetId);
          merged.push({
            ...serverItemToLocal(item),
            // Preserve local timestamp if exists (for ordering)
            timestamp: localVerse?.timestamp || new Date(item.createdAt).getTime(),
          });
        });

        // Add local-only items (they've been synced above, but we don't have serverIds yet)
        localPinnedVerses.forEach((v) => {
          if (!seenKeys.has(v.verseKey)) {
            merged.push(v);
          }
        });

        // 5. Update Redux with merged list
        dispatch(setPinnedVerses(merged));

        // 6. Build serverId mapping
        const idMapping: Record<string, string> = {};
        serverItems.forEach((item) => {
          idMapping[item.targetId] = item.id;
        });
        if (Object.keys(idMapping).length > 0) {
          dispatch(setServerIds(idMapping));
        }

        hasSyncedRef.current = true;
      } catch (error) {
        logErrorToSentry(error, {
          transactionName: 'useSyncPinnedVerses',
          metadata: { pinnedCount: localPinnedVerses.length, mushafId, attempt },
        });
        // Retry with exponential backoff
        if (attempt < MAX_SYNC_ATTEMPTS - 1) {
          const delay = INITIAL_RETRY_DELAY_MS * 2 ** attempt;
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => performSync(attempt + 1), delay);
        }
      }
    },
    [localPinnedVerses, mushafId, dispatch],
  );

  useEffect(() => {
    if (!isLoggedIn) {
      hasSyncedRef.current = false;
      return () => {};
    }
    if (!isPersistGateHydrationComplete) {
      return () => {};
    }
    if (!hasSyncedRef.current && !isSyncingRef.current) {
      isSyncingRef.current = true;
      performSync().finally(() => {
        isSyncingRef.current = false;
      });
    }
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [isLoggedIn, isPersistGateHydrationComplete, performSync]);
};

export default useSyncPinnedVerses;
