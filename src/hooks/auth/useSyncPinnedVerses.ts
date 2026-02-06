import { useEffect, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { performPinnedSync } from '@/hooks/auth/pinnedVersesSync';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { getLastSyncAt } from '@/utils/auth/userDataSync';

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
    if (!isPersistGateHydrationComplete) return () => {};
    if (hasSyncedRef.current || isSyncingRef.current) return () => {};
    if (getLastSyncAt()) return () => {};

    const currentRetryTimeoutRef = retryTimeoutRef;
    isSyncingRef.current = true;
    performPinnedSync({
      localPinnedRef: localPinnedVersesRef,
      mushafIdRef,
      dispatch,
      hasSyncedRef,
      retryTimeoutRef,
    }).finally(() => {
      isSyncingRef.current = false;
    });

    return () => {
      if (currentRetryTimeoutRef.current) clearTimeout(currentRetryTimeoutRef.current);
    };
  }, [isLoggedIn, isPersistGateHydrationComplete, dispatch]);
};

export default useSyncPinnedVerses;
