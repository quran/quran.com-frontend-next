import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import {
  PinnedVerse,
  pinVerse,
  unpinVerse,
  clearPinnedVerses,
  setPinnedVerses,
} from '@/redux/slices/QuranReader/pinnedVerses';

const CHANNEL_NAME = 'pinned-verses-sync';

export enum PinnedVersesBroadcastType {
  PIN = 'PIN_VERSE',
  UNPIN = 'UNPIN_VERSE',
  CLEAR = 'CLEAR_PINNED',
  SET = 'SET_PINNED',
}

interface BroadcastMessage {
  type: PinnedVersesBroadcastType;
  payload?: { verseKey?: string; verses?: PinnedVerse[] };
}

/**
 * Plain function to broadcast pinned verse changes to other tabs.
 * Does NOT use React hooks — safe to call from any callback.
 */
export const broadcastPinnedVerses = (type: PinnedVersesBroadcastType, payload?: unknown) => {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type, payload });
  channel.close();
};

/**
 * Listener hook — mount ONCE at the top level (e.g. UserAccountModal).
 * Listens for pinned verse changes from other tabs and dispatches to Redux.
 */
const usePinnedVersesBroadcastListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;

    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const { type, payload } = event.data;
      switch (type) {
        case PinnedVersesBroadcastType.PIN:
          if (payload?.verseKey) dispatch(pinVerse(payload.verseKey));
          break;
        case PinnedVersesBroadcastType.UNPIN:
          if (payload?.verseKey) dispatch(unpinVerse(payload.verseKey));
          break;
        case PinnedVersesBroadcastType.CLEAR:
          dispatch(clearPinnedVerses());
          break;
        case PinnedVersesBroadcastType.SET:
          if (payload?.verses) dispatch(setPinnedVerses(payload.verses));
          break;
        default:
          break;
      }
    };

    return () => channel.close();
  }, [dispatch]);
};

export default usePinnedVersesBroadcastListener;
