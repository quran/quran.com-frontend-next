import { useCallback } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { logErrorToSentry } from '@/lib/sentry';
import {
  PinnedVerse,
  pinVerse,
  unpinVerse,
  clearPinnedVerses,
  setPinnedVerses,
  setServerIds,
  selectPinnedVerses,
} from '@/redux/slices/QuranReader/pinnedVerses';
import {
  addPinnedItem,
  deletePinnedItemById,
  deletePinnedItemByKey,
  clearPinnedItems,
} from '@/utils/auth/api';
import { PINNED_ITEMS_CACHE_PATHS } from '@/utils/auth/apiPaths';

const isPinnedItemsCacheKey = (key: unknown): boolean =>
  typeof key === 'string' &&
  Object.values(PINNED_ITEMS_CACHE_PATHS).some((p) => key.includes(p));

const usePinnedVerseSync = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useIsLoggedIn();
  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const { mutate: globalMutate } = useSWRConfig();

  const invalidateCache = useCallback(() => {
    globalMutate(isPinnedItemsCacheKey, undefined, { revalidate: true });
  }, [globalMutate]);

  const pinVerseWithSync = useCallback(
    async (verseKey: string, metadata?: Record<string, unknown>) => {
      // Optimistic update
      dispatch(pinVerse(verseKey));

      if (isLoggedIn) {
        try {
          const response = await addPinnedItem({
            targetType: 'ayah',
            targetId: verseKey,
            metadata,
          });
          dispatch(setServerIds({ [verseKey]: response.id }));
          invalidateCache();
        } catch (error) {
          // Rollback
          dispatch(unpinVerse(verseKey));
          logErrorToSentry(error, {
            transactionName: 'usePinnedVerseSync.pin',
            metadata: { verseKey },
          });
        }
      }
    },
    [dispatch, isLoggedIn, invalidateCache],
  );

  const unpinVerseWithSync = useCallback(
    async (verseKey: string) => {
      const verse = pinnedVerses.find((v) => v.verseKey === verseKey);
      const { serverId } = verse || {};

      // Optimistic update
      dispatch(unpinVerse(verseKey));

      if (isLoggedIn) {
        try {
          if (serverId) {
            await deletePinnedItemById(serverId);
          } else {
            await deletePinnedItemByKey({ targetType: 'ayah', targetId: verseKey });
          }
          invalidateCache();
        } catch (error) {
          // Rollback
          dispatch(pinVerse(verseKey));
          logErrorToSentry(error, {
            transactionName: 'usePinnedVerseSync.unpin',
            metadata: { verseKey, serverId },
          });
        }
      }
    },
    [dispatch, isLoggedIn, pinnedVerses, invalidateCache],
  );

  const clearPinnedWithSync = useCallback(async () => {
    const savedVerses = [...pinnedVerses];

    // Optimistic update
    dispatch(clearPinnedVerses());

    if (isLoggedIn) {
      try {
        await clearPinnedItems('ayah');
        invalidateCache();
      } catch (error) {
        // Rollback
        dispatch(setPinnedVerses(savedVerses));
        logErrorToSentry(error, {
          transactionName: 'usePinnedVerseSync.clear',
        });
      }
    }
  }, [dispatch, isLoggedIn, pinnedVerses, invalidateCache]);

  return { pinVerseWithSync, unpinVerseWithSync, clearPinnedWithSync };
};

export default usePinnedVerseSync;
