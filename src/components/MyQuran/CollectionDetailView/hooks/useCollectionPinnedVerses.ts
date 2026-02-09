import { useCallback } from 'react';

import { DispatchFn, GlobalMutateFn, ToastFn, TranslateFn } from '../types';

import { ToastStatus } from '@/dls/Toast/Toast';
import { broadcastPinnedVerses, PinnedVersesBroadcastType } from '@/hooks/usePinnedVersesBroadcast';
import { logErrorToSentry } from '@/lib/sentry';
import { pinVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import Bookmark from '@/types/Bookmark';
import { syncPinnedItems } from '@/utils/auth/api';
import { buildPinnedSyncPayload, isPinnedItemsCacheKey } from '@/utils/auth/pinnedItems';
import { logButtonClick } from '@/utils/eventLogger';
import { makeVerseKey } from '@/utils/verse';

interface UseCollectionPinnedVersesParams {
  dispatch: DispatchFn;
  globalMutate: GlobalMutateFn;
  isLoggedIn: boolean;
  mushafId: number;
  toast: ToastFn;
  t: TranslateFn;
  numericCollectionId: string;
  filteredBookmarks: Bookmark[];
  selectedBookmarks: Set<string>;
}

const useCollectionPinnedVerses = ({
  dispatch,
  globalMutate,
  isLoggedIn,
  mushafId,
  toast,
  t,
  numericCollectionId,
  filteredBookmarks,
  selectedBookmarks,
}: UseCollectionPinnedVersesParams) => {
  const pinVersesLocally = useCallback(
    (verseKeys: string[]) => {
      dispatch(pinVerses(verseKeys));
      verseKeys.forEach((vk) => {
        broadcastPinnedVerses(PinnedVersesBroadcastType.PIN, { verseKey: vk });
      });
    },
    [dispatch],
  );

  const syncPinnedVerses = useCallback(
    async (verseKeys: string[]) => {
      const syncPayload = verseKeys.map((vk) => buildPinnedSyncPayload(vk, mushafId));
      await syncPinnedItems(syncPayload);
      await globalMutate(isPinnedItemsCacheKey, undefined, { revalidate: true });
    },
    [globalMutate, mushafId],
  );

  const pinVersesAndSync = useCallback(
    async (verseKeys: string[]) => {
      pinVersesLocally(verseKeys);

      if (isLoggedIn) {
        try {
          await syncPinnedVerses(verseKeys);
        } catch (syncError) {
          logErrorToSentry(syncError, { transactionName: 'collectionDetail.pinVerses' });
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
            actions: [{ text: t('common:retry'), onClick: () => pinVersesAndSync(verseKeys) }],
          });
          return;
        }
      }

      toast(t('quran-reader:verses-pinned', { count: verseKeys.length }), {
        status: ToastStatus.Success,
      });
    },
    [isLoggedIn, pinVersesLocally, syncPinnedVerses, t, toast],
  );

  const handlePinAllVerses = useCallback(() => {
    const verseKeys = filteredBookmarks
      .filter((b) => Boolean(b.verseNumber))
      .map((b) => makeVerseKey(b.key, b.verseNumber));
    logButtonClick('collection_detail_pin_all_verses', {
      collectionId: numericCollectionId,
      count: verseKeys.length,
    });
    pinVersesAndSync(verseKeys);
  }, [filteredBookmarks, numericCollectionId, pinVersesAndSync]);

  const handlePinSelectedVerses = useCallback(() => {
    const verseKeys = filteredBookmarks
      .filter((b) => selectedBookmarks.has(b.id) && Boolean(b.verseNumber))
      .map((b) => makeVerseKey(b.key, b.verseNumber));
    logButtonClick('collection_detail_pin_selected_verses', {
      collectionId: numericCollectionId,
      count: verseKeys.length,
    });
    pinVersesAndSync(verseKeys);
  }, [filteredBookmarks, numericCollectionId, pinVersesAndSync, selectedBookmarks]);

  return { handlePinAllVerses, handlePinSelectedVerses };
};

export default useCollectionPinnedVerses;
