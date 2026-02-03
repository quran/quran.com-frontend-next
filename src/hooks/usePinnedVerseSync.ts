import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { broadcastPinnedVerses, PinnedVersesBroadcastType } from '@/hooks/usePinnedVersesBroadcast';
import { logErrorToSentry } from '@/lib/sentry';
import {
  pinVerse,
  unpinVerse,
  clearPinnedVerses,
  setPinnedVerses,
  setServerIds,
  selectPinnedVerses,
} from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { addPinnedItem, deletePinnedItemById, clearPinnedItems } from '@/utils/auth/api';
import { isPinnedItemsCacheKey } from '@/utils/auth/pinnedItems';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import { PinnedItemTargetType } from 'types/PinnedItem';

const usePinnedVerseSync = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const toast = useToast();
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
      dispatch(pinVerse(verseKey));
      broadcastPinnedVerses(PinnedVersesBroadcastType.PIN, { verseKey });

      if (isLoggedIn) {
        try {
          const response = await addPinnedItem({
            targetType: PinnedItemTargetType.Ayah,
            targetId: verseKey,
            metadata: {
              sourceMushafId: mushafId,
              key: getChapterNumberFromKey(verseKey),
              verseNumber: getVerseNumberFromKey(verseKey),
            },
          });
          dispatch(setServerIds({ [verseKey]: response.id }));
          invalidateCache();
        } catch (error) {
          dispatch(unpinVerse(verseKey));
          broadcastPinnedVerses(PinnedVersesBroadcastType.UNPIN, { verseKey });
          toast(t('error.general'), {
            status: ToastStatus.Error,
            actions: [{ text: t('retry'), onClick: () => pinVerseWithSync(verseKey) }],
          });
          logErrorToSentry(error, {
            transactionName: 'usePinnedVerseSync.pin',
            metadata: { verseKey },
          });
        }
      }
    },
    [dispatch, isLoggedIn, mushafId, invalidateCache, t, toast],
  );

  const unpinVerseWithSync = useCallback(
    async (verseKey: string) => {
      const verse = pinnedVerses.find((v) => v.verseKey === verseKey);
      const { serverId } = verse || {};

      dispatch(unpinVerse(verseKey));
      broadcastPinnedVerses(PinnedVersesBroadcastType.UNPIN, { verseKey });

      if (isLoggedIn && serverId) {
        try {
          await deletePinnedItemById(serverId);
          invalidateCache();
        } catch (error) {
          dispatch(pinVerse(verseKey));
          broadcastPinnedVerses(PinnedVersesBroadcastType.PIN, { verseKey });
          toast(t('error.general'), {
            status: ToastStatus.Error,
            actions: [{ text: t('retry'), onClick: () => unpinVerseWithSync(verseKey) }],
          });
          logErrorToSentry(error, {
            transactionName: 'usePinnedVerseSync.unpin',
            metadata: { verseKey, serverId },
          });
        }
      }
    },
    [dispatch, isLoggedIn, pinnedVerses, invalidateCache, t, toast],
  );

  const clearPinnedWithSync = useCallback(async () => {
    const savedVerses = [...pinnedVerses];

    dispatch(clearPinnedVerses());
    broadcastPinnedVerses(PinnedVersesBroadcastType.CLEAR);

    if (isLoggedIn) {
      try {
        await clearPinnedItems(PinnedItemTargetType.Ayah);
        invalidateCache();
      } catch (error) {
        dispatch(setPinnedVerses(savedVerses));
        broadcastPinnedVerses(PinnedVersesBroadcastType.SET, { verses: savedVerses });
        toast(t('error.general'), {
          status: ToastStatus.Error,
          actions: [{ text: t('retry'), onClick: () => clearPinnedWithSync() }],
        });
        logErrorToSentry(error, {
          transactionName: 'usePinnedVerseSync.clear',
        });
      }
    }
  }, [dispatch, isLoggedIn, pinnedVerses, invalidateCache, t, toast]);

  return { pinVerseWithSync, unpinVerseWithSync, clearPinnedWithSync };
};

export default usePinnedVerseSync;
