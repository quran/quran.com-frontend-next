import { useEffect } from 'react';

import { useDispatch } from 'react-redux';
import useSWR from 'swr';

import {
  PinnedVerse,
  setPinnedVerses,
  setServerIds,
} from '@/redux/slices/QuranReader/pinnedVerses';
import { getPinnedItems } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { getVerseNumberFromKey, getChapterNumberFromKey } from '@/utils/verse';
import { PinnedItemDTO, PinnedItemTargetType } from 'types/PinnedItem';

export const PINNED_VERSES_KEY = 'pinned-verses';

const serverItemToLocal = (item: PinnedItemDTO): PinnedVerse => ({
  verseKey: item.targetId,
  chapterNumber:
    (item.metadata?.chapterNumber as number) || getChapterNumberFromKey(item.targetId),
  verseNumber: (item.metadata?.verseNumber as number) || getVerseNumberFromKey(item.targetId),
  timestamp: new Date(item.createdAt).getTime(),
  serverId: item.id,
});

/**
 * Global SWR hook that fetches pinned verses from the backend on page load
 * for logged-in users. Overrides Redux state with server data to ensure
 * consistency across sessions and devices.
 *
 * Mount this in a top-level component (e.g. UserAccountModal).
 */
const useGlobalPinnedVerses = () => {
  const dispatch = useDispatch();

  const { data } = useSWR<{ data: PinnedItemDTO[] }>(
    isLoggedIn() ? PINNED_VERSES_KEY : null,
    () => getPinnedItems(PinnedItemTargetType.Ayah),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      revalidateIfStale: true,
    },
  );

  useEffect(() => {
    if (!data?.data) return;

    const serverItems = data.data;
    const pinnedVerses = serverItems.map(serverItemToLocal);
    pinnedVerses.sort((a, b) => a.timestamp - b.timestamp);
    dispatch(setPinnedVerses(pinnedVerses));

    const idMapping: Record<string, string> = {};
    serverItems.forEach((item) => {
      idMapping[item.targetId] = item.id;
    });
    if (Object.keys(idMapping).length > 0) {
      dispatch(setServerIds(idMapping));
    }
  }, [data, dispatch]);
};

export default useGlobalPinnedVerses;
