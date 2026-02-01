import { useCallback } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import {
  broadcastPinnedVerses,
  PinnedVersesBroadcastType,
} from '@/hooks/usePinnedVersesBroadcast';
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
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import {
  addPinnedItem,
  deletePinnedItemById,
  clearPinnedItems,
} from '@/utils/auth/api';
import { PINNED_ITEMS_CACHE_PATHS } from '@/utils/auth/apiPaths';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';

const isPinnedItemsCacheKey = (key: unknown): boolean =>
  typeof key === 'string' &&
  Object.values(PINNED_ITEMS_CACHE_PATHS).some((p) => key.includes(p));

const usePinnedVerseSync = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useIsLoggedIn();
  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const { mutate: globalMutate } = useSWRConfig();
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);
  const invalidateCache = useCallback(() => {
    globalMutate(isPinnedItemsCacheKey, undefined, { revalidate: true });
  }, [globalMutate]);

  const pinVerseWithSync = useCallback(
    async (verseKey: string) => {
      // Optimistic update
      dispatch(pinVerse(verseKey));
      // Broadcast to other tabs
      broadcastPinnedVerses(PinnedVersesBroadcastType.PIN, { verseKey });

      if (isLoggedIn) {
        try {
          const chapterNumber = getChapterNumberFromKey(verseKey);
          const verseNumber = getVerseNumberFromKey(verseKey);

          const response = await addPinnedItem({
            targetType: 'ayah',
            targetId: verseKey,
            metadata: {
              sourceMushafId: mushafId,
              key: chapterNumber,
              verseNumber,
            },
          });
          dispatch(setServerIds({ [verseKey]: response.id }));
          invalidateCache();
        } catch (error) {
          // Rollback
          dispatch(unpinVerse(verseKey));
          broadcastPinnedVerses(PinnedVersesBroadcastType.UNPIN, { verseKey });
          logErrorToSentry(error, {
            transactionName: 'usePinnedVerseSync.pin',
            metadata: { verseKey },
          });
        }
      }
    },
    [dispatch, isLoggedIn, mushafId, invalidateCache],
  );

  const unpinVerseWithSync = useCallback(
    async (verseKey: string) => {
      const verse = pinnedVerses.find((v) => v.verseKey === verseKey);
      const { serverId } = verse || {};

      // Optimistic update
      dispatch(unpinVerse(verseKey));
      // Broadcast to other tabs
      broadcastPinnedVerses(PinnedVersesBroadcastType.UNPIN, { verseKey });

      if (isLoggedIn && serverId) {
        try {
          await deletePinnedItemById(serverId);
          invalidateCache();
        } catch (error) {
          // Rollback
          dispatch(pinVerse(verseKey));
          broadcastPinnedVerses(PinnedVersesBroadcastType.PIN, { verseKey });
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
    // Broadcast to other tabs
    broadcastPinnedVerses(PinnedVersesBroadcastType.CLEAR);

    if (isLoggedIn) {
      try {
        await clearPinnedItems('ayah');
        invalidateCache();
      } catch (error) {
        // Rollback
        dispatch(setPinnedVerses(savedVerses));
        broadcastPinnedVerses(PinnedVersesBroadcastType.SET, { verses: savedVerses });
        logErrorToSentry(error, {
          transactionName: 'usePinnedVerseSync.clear',
        });
      }
    }
  }, [dispatch, isLoggedIn, pinnedVerses, invalidateCache]);

  return { pinVerseWithSync, unpinVerseWithSync, clearPinnedWithSync };
};

export default usePinnedVerseSync;
