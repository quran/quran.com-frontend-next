import { useCallback, useEffect, useRef } from 'react';

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

const usePinnedVersesBroadcast = () => {
  const dispatch = useDispatch();
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

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

  const broadcast = useCallback((type: PinnedVersesBroadcastType, payload?: unknown) => {
    channelRef.current?.postMessage({ type, payload });
  }, []);

  return { broadcast };
};

export default usePinnedVersesBroadcast;
