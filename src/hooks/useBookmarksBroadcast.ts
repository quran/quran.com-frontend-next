/* eslint-disable max-lines */
import { useCallback, useEffect, useRef } from 'react';

import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';
import { Cache, ScopedMutator } from 'swr/dist/types';

import { SURAH_BOOKMARKS_KEY, SURAH_BOOKMARKS_PREFIX } from '@/hooks/auth/useSurahBookmarks';
import { setGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import Bookmark from '@/types/Bookmark';
import { BOOKMARK_CACHE_PATHS } from '@/utils/auth/apiPaths';
import { isLoggedIn as isLoggedInCookie } from '@/utils/auth/login';
import { GuestReadingBookmark } from '@/utils/bookmark';
import BookmarksMap from 'types/BookmarksMap';

const CHANNEL_NAME = 'bookmarks-sync';
const STORAGE_KEY = 'qdc:bookmarks-sync';
const MAX_PROCESSED_EVENTS = 200;
const READING_BOOKMARK_PREFIX = 'reading-bookmark-';

let tabId: string | null = null;

const getTabId = (): string => {
  if (tabId) return tabId;

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    tabId = crypto.randomUUID();
    return tabId;
  }

  tabId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return tabId;
};

const createEventId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export enum BookmarksBroadcastType {
  MUTATION = 'BOOKMARKS_MUTATION',
}

export interface BookmarksBroadcastPayload {
  touchesReadingBookmark?: boolean;
  touchesCollectionsList?: boolean;
  touchesBookmarksList?: boolean;
  touchesBookmarkCollections?: boolean;
  touchesCollectionDetail?: boolean;
  affectedCollectionIds?: string[];
  affectedSurahNumbers?: number[];
  mushafId?: number;
  readingBookmark?: Bookmark | null;
  guestReadingBookmark?: GuestReadingBookmark | null;
  surahBookmarkUpdates?: Array<{
    mushafId: number;
    surahNumber: number;
    verseKey: string;
    bookmark: Bookmark | null;
  }>;
}

interface BookmarksBroadcastMessage {
  type: BookmarksBroadcastType;
  payload: BookmarksBroadcastPayload & {
    eventId: string;
    sourceTabId: string;
    timestamp: number;
  };
}

const isCollectionDetailKey = (key: string) => {
  return key.includes('/collections/');
};

const hasCollectionIdInKey = (key: string, collectionIds: string[]): boolean => {
  return collectionIds.some((collectionId) => key.includes(`/collections/${collectionId}?`));
};

const extractSurahFromSurahCacheKey = (key: string): number | null => {
  if (!key.startsWith(SURAH_BOOKMARKS_PREFIX)) return null;

  const parts = key.replace(SURAH_BOOKMARKS_PREFIX, '').split('-');
  const surahStr = parts[1];
  const surah = Number(surahStr);

  return Number.isFinite(surah) ? surah : null;
};

const normalizeMessage = (message: unknown): BookmarksBroadcastMessage | null => {
  if (!message || typeof message !== 'object') return null;
  if (!('type' in message) || !('payload' in message)) return null;

  const typedMessage = message as Partial<BookmarksBroadcastMessage>;
  if (typedMessage.type !== BookmarksBroadcastType.MUTATION || !typedMessage.payload) return null;

  return typedMessage as BookmarksBroadcastMessage;
};

const getStringCacheKeys = (cache: Cache): string[] => {
  if (!cache || typeof cache !== 'object') return [];

  const cacheAsMap = cache as unknown as {
    keys?: () => Iterable<unknown>;
    forEach?: (callback: (value: unknown, key: unknown) => void) => void;
  };

  if (typeof cacheAsMap.keys === 'function') {
    return Array.from(cacheAsMap.keys()).filter((key): key is string => typeof key === 'string');
  }

  if (typeof cacheAsMap.forEach === 'function') {
    const keys: string[] = [];
    cacheAsMap.forEach((value, key) => {
      if (typeof key === 'string') keys.push(key);
    });
    return keys;
  }

  return [];
};

const mutateMatchingKeys = <T = unknown>(
  cache: Cache,
  globalMutate: ScopedMutator,
  matcher: (key: string) => boolean,
  data?: T | ((currentData: T | undefined) => T),
  options: { revalidate?: boolean } = { revalidate: true },
) => {
  const keys = getStringCacheKeys(cache);
  const matchedKeys = keys.filter(matcher);
  matchedKeys.forEach((key) => {
    globalMutate(key, data as any, options);
  });
};

const revalidateCollectionsListCaches = (cache: Cache, globalMutate: ScopedMutator) =>
  mutateMatchingKeys(
    cache,
    globalMutate,
    (key) => key.includes(BOOKMARK_CACHE_PATHS.COLLECTIONS),
    undefined,
    { revalidate: true },
  );

const revalidateBookmarksListCaches = (cache: Cache, globalMutate: ScopedMutator) =>
  mutateMatchingKeys(
    cache,
    globalMutate,
    (key) => key.includes(BOOKMARK_CACHE_PATHS.BOOKMARKS_LIST),
    undefined,
    { revalidate: true },
  );

const revalidateBookmarkCollectionsCaches = (cache: Cache, globalMutate: ScopedMutator) => {
  mutateMatchingKeys(
    cache,
    globalMutate,
    (key) => key.includes(BOOKMARK_CACHE_PATHS.BOOKMARK_COLLECTIONS),
    undefined,
    { revalidate: true },
  );
  mutateMatchingKeys(
    cache,
    globalMutate,
    (key) => key.includes(BOOKMARK_CACHE_PATHS.BOOKMARK),
    undefined,
    { revalidate: true },
  );
};

const revalidateCollectionDetailCaches = (
  cache: Cache,
  globalMutate: ScopedMutator,
  collectionIds?: string[],
) =>
  mutateMatchingKeys(
    cache,
    globalMutate,
    (key: string) => {
      if (!isCollectionDetailKey(key)) return false;
      if (!collectionIds?.length) return true;
      return hasCollectionIdInKey(key, collectionIds);
    },
    undefined,
    { revalidate: true },
  );

const revalidateReadingBookmarkCaches = (
  cache: Cache,
  globalMutate: ScopedMutator,
  mushafId?: number,
) =>
  mutateMatchingKeys(
    cache,
    globalMutate,
    (key: string) => {
      if (!key.startsWith(READING_BOOKMARK_PREFIX)) return false;
      if (!mushafId) return true;
      return key.endsWith(`-${mushafId}`);
    },
    undefined,
    { revalidate: true },
  );

const updateReadingBookmarkCaches = (
  cache: Cache,
  globalMutate: ScopedMutator,
  readingBookmark: Bookmark | null,
  mushafId?: number,
) =>
  mutateMatchingKeys(
    cache,
    globalMutate,
    (key: string) => {
      if (!key.startsWith(READING_BOOKMARK_PREFIX)) return false;
      if (!mushafId) return true;
      return key.endsWith(`-${mushafId}`);
    },
    readingBookmark,
    { revalidate: false },
  );

const revalidateSurahCaches = (
  cache: Cache,
  globalMutate: ScopedMutator,
  mushafId?: number,
  surahNumbers?: number[],
) => {
  if (!surahNumbers?.length) return;

  if (mushafId) {
    surahNumbers.forEach((surahNumber) => {
      globalMutate(SURAH_BOOKMARKS_KEY(mushafId, surahNumber), undefined, { revalidate: true });
    });
    return;
  }

  mutateMatchingKeys(
    cache,
    globalMutate,
    (key: string) => {
      const surah = extractSurahFromSurahCacheKey(key);
      return surah !== null && surahNumbers.includes(surah);
    },
    undefined,
    { revalidate: true },
  );
};

const applySurahBookmarkUpdates = (
  cache: Cache,
  globalMutate: ScopedMutator,
  updates: NonNullable<BookmarksBroadcastPayload['surahBookmarkUpdates']>,
) => {
  updates.forEach(({ mushafId, surahNumber, verseKey, bookmark }) => {
    const targetKey = SURAH_BOOKMARKS_KEY(mushafId, surahNumber);
    const existingKeys = new Set(getStringCacheKeys(cache));
    if (!existingKeys.has(targetKey)) return;

    globalMutate(
      targetKey,
      (currentMap?: BookmarksMap) => {
        const nextMap = { ...(currentMap || {}) };
        if (bookmark) {
          nextMap[verseKey] = bookmark;
        } else {
          delete nextMap[verseKey];
        }
        return nextMap;
      },
      { revalidate: false },
    );
  });
};

const applyPayloadSync = ({
  cache,
  globalMutate,
  payload,
}: {
  cache: Cache;
  globalMutate: ScopedMutator;
  payload: BookmarksBroadcastMessage['payload'];
}) => {
  if (payload.touchesReadingBookmark) {
    if (payload.readingBookmark !== undefined) {
      updateReadingBookmarkCaches(cache, globalMutate, payload.readingBookmark, payload.mushafId);
    } else {
      revalidateReadingBookmarkCaches(cache, globalMutate, payload.mushafId);
    }
  }

  if (payload.touchesCollectionsList) {
    revalidateCollectionsListCaches(cache, globalMutate);
  }

  if (payload.touchesBookmarksList) {
    revalidateBookmarksListCaches(cache, globalMutate);
  }

  if (payload.touchesBookmarkCollections) {
    revalidateBookmarkCollectionsCaches(cache, globalMutate);
  }

  if (payload.touchesCollectionDetail) {
    revalidateCollectionDetailCaches(cache, globalMutate, payload.affectedCollectionIds);
  }

  if (payload.surahBookmarkUpdates?.length) {
    applySurahBookmarkUpdates(cache, globalMutate, payload.surahBookmarkUpdates);
  } else {
    revalidateSurahCaches(cache, globalMutate, payload.mushafId, payload.affectedSurahNumbers);
  }
};

const postWithStorageFallback = (message: BookmarksBroadcastMessage): void => {
  if (typeof window === 'undefined') return;

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(message);
    channel.close();
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Swallow localStorage exceptions (quota/private mode) and keep BroadcastChannel path.
  }
};

export const broadcastBookmarksUpdate = (payload: BookmarksBroadcastPayload): void => {
  postWithStorageFallback({
    type: BookmarksBroadcastType.MUTATION,
    payload: {
      ...payload,
      eventId: createEventId(),
      sourceTabId: getTabId(),
      timestamp: Date.now(),
    },
  });
};

const useBookmarksBroadcastListener = () => {
  const dispatch = useDispatch();
  const { mutate: globalMutate, cache } = useSWRConfig();

  const processedEventIdsRef = useRef<Set<string>>(new Set());
  const processedQueueRef = useRef<string[]>([]);

  const markProcessed = useCallback((eventId: string) => {
    if (processedEventIdsRef.current.has(eventId)) return false;

    processedEventIdsRef.current.add(eventId);
    processedQueueRef.current.push(eventId);

    if (processedQueueRef.current.length > MAX_PROCESSED_EVENTS) {
      const oldestEventId = processedQueueRef.current.shift();
      if (oldestEventId) processedEventIdsRef.current.delete(oldestEventId);
    }

    return true;
  }, []);

  const handleIncomingMessage = useCallback(
    (rawMessage: unknown) => {
      const message = normalizeMessage(rawMessage);
      if (!message) return;

      const { payload } = message;
      if (payload.sourceTabId === getTabId()) return;
      if (!markProcessed(payload.eventId)) return;

      if (!isLoggedInCookie() && payload.guestReadingBookmark !== undefined) {
        dispatch(setGuestReadingBookmark(payload.guestReadingBookmark));
      }

      applyPayloadSync({ cache, globalMutate, payload });
    },
    [cache, dispatch, globalMutate, markProcessed],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let channel: BroadcastChannel | undefined;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent<BookmarksBroadcastMessage>) => {
        handleIncomingMessage(event.data);
      };
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;

      try {
        handleIncomingMessage(JSON.parse(event.newValue));
      } catch {
        // Ignore malformed payloads from storage.
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', onStorage);
    };
  }, [handleIncomingMessage]);
};

export default useBookmarksBroadcastListener;
