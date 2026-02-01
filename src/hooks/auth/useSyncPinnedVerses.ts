import { useEffect, useRef } from 'react';

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
import { getLastSyncAt } from '@/utils/auth/userDataSync';
import { getVerseNumberFromKey, getChapterNumberFromKey } from '@/utils/verse';
import { SyncPinnedItemPayload } from 'types/PinnedItem';
import { PinnedItemDTO } from 'types/PinnedItem';

const MAX_SYNC_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const POLL_INTERVAL_MS = 500;
const MAX_POLL_ATTEMPTS = 20;

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
 * Convert a local PinnedVerse to a sync payload with metadata.
 */
const localToSyncPayload = (verse: PinnedVerse, mushafId: number): SyncPinnedItemPayload => ({
  targetType: 'ayah',
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
 * @returns {Promise<boolean>} true if lastSyncAt was found, false if timed out.
 */
const waitForMainSync = (): Promise<boolean> =>
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
 * Syncs pinned verses with the backend on first login only.
 *
 * Flow:
 * 1. Waits for useSyncUserData to complete (sets lastSyncAt cookie)
 * 2. Fetches server pinned items
 * 3. Pushes local-only items to server (with metadata)
 * 4. Merges server + local, sorts oldest to newest
 * 5. Overrides Redux with merged list
 *
 * On subsequent page refreshes, useGlobalPinnedVerses handles fetching
 * from backend (source of truth) and hydrating Redux.
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

  const localPinnedVersesRef = useRef(localPinnedVerses);
  localPinnedVersesRef.current = localPinnedVerses;
  const mushafIdRef = useRef(mushafId);
  mushafIdRef.current = mushafId;

  useEffect(() => {
    if (!isLoggedIn) {
      hasSyncedRef.current = false;
      return () => {};
    }
    if (!isPersistGateHydrationComplete) {
      return () => {};
    }
    if (hasSyncedRef.current || isSyncingRef.current) {
      return () => {};
    }
    if (getLastSyncAt()) {
      return () => {};
    }

    const performSync = async (attempt = 0): Promise<void> => {
      const mainSyncDone = await waitForMainSync();
      if (!mainSyncDone) return;

      const currentLocalPinned = localPinnedVersesRef.current;
      const currentMushafId = mushafIdRef.current;

      try {
        const { data: serverItems } = await getPinnedItems('ayah');

        const serverMap = new Map<string, PinnedItemDTO>();
        serverItems.forEach((item) => serverMap.set(item.targetId, item));

        const localMap = new Map<string, PinnedVerse>();
        currentLocalPinned.forEach((v) => localMap.set(v.verseKey, v));

        const localOnlyItems: SyncPinnedItemPayload[] = [];
        currentLocalPinned.forEach((v) => {
          if (!serverMap.has(v.verseKey)) {
            localOnlyItems.push(localToSyncPayload(v, currentMushafId));
          }
        });

        if (localOnlyItems.length > 0) {
          await syncPinnedItems(localOnlyItems);
        }

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

        currentLocalPinned.forEach((v) => {
          if (!seenKeys.has(v.verseKey)) {
            merged.push(v);
          }
        });

        merged.sort((a, b) => a.timestamp - b.timestamp);
        dispatch(setPinnedVerses(merged));

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
          metadata: { pinnedCount: currentLocalPinned.length, mushafId: currentMushafId, attempt },
        });
        if (attempt < MAX_SYNC_ATTEMPTS - 1) {
          const delay = INITIAL_RETRY_DELAY_MS * 2 ** attempt;
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => performSync(attempt + 1), delay);
        }
      }
    };

    isSyncingRef.current = true;
    performSync().finally(() => {
      isSyncingRef.current = false;
    });

    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [isLoggedIn, isPersistGateHydrationComplete, dispatch]);
};

export default useSyncPinnedVerses;
