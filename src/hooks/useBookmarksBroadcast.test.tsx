/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { renderHook } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import useBookmarksBroadcastListener, { broadcastBookmarksUpdate } from './useBookmarksBroadcast';

import BookmarkType from '@/types/BookmarkType';

const { mutateMock, dispatchMock, isLoggedInMock, cacheMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  dispatchMock: vi.fn(),
  isLoggedInMock: vi.fn(() => false),
  cacheMock: new Map<string, unknown>(),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => dispatchMock,
}));

vi.mock('swr', async () => {
  const actual = await vi.importActual<object>('swr');
  return {
    ...actual,
    useSWRConfig: () => ({ mutate: mutateMock, cache: cacheMock }),
  };
});

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: isLoggedInMock,
}));

type BroadcastPayload = {
  type: 'BOOKMARKS_MUTATION';
  payload: Record<string, unknown>;
};

class MockBroadcastChannel {
  static instances: MockBroadcastChannel[] = [];

  static postedMessages: BroadcastPayload[] = [];

  public onmessage: ((event: MessageEvent<BroadcastPayload>) => void) | null = null;

  private readonly name: string;

  private closed = false;

  constructor(name: string) {
    this.name = name;
    MockBroadcastChannel.instances.push(this);
  }

  postMessage = (message: BroadcastPayload) => {
    MockBroadcastChannel.postedMessages.push(message);

    MockBroadcastChannel.instances
      .filter((channel) => channel.name === this.name && channel !== this && !channel.closed)
      .forEach((channel) =>
        channel.onmessage?.({ data: message } as MessageEvent<BroadcastPayload>),
      );
  };

  close = () => {
    this.closed = true;
  };

  static reset() {
    MockBroadcastChannel.instances = [];
    MockBroadcastChannel.postedMessages = [];
  }
}

describe('useBookmarksBroadcast', () => {
  const originalBroadcastChannel = globalThis.BroadcastChannel;

  beforeEach(() => {
    vi.clearAllMocks();
    MockBroadcastChannel.reset();
    isLoggedInMock.mockReturnValue(false);
    (globalThis as any).BroadcastChannel = MockBroadcastChannel;
    cacheMock.clear();
    cacheMock.set('reading-bookmark-user-1-4', { key: 1 });
    cacheMock.set('reading-bookmark-user-1-7', { key: 1 });
    cacheMock.set('/api/proxy/collections?type=ayah', { data: [] });
    cacheMock.set('/api/proxy/bookmarks?mushafId=4', []);
    cacheMock.set('/api/proxy/bookmarks/collections?mushafId=4', []);
    cacheMock.set('/api/proxy/bookmarks/bookmark?mushafId=4', {});
    cacheMock.set('/api/proxy/collections/123?limit=20', { data: [] });
    cacheMock.set('/api/proxy/collections/999?limit=20', { data: [] });
  });

  afterEach(() => {
    if (originalBroadcastChannel) {
      (globalThis as any).BroadcastChannel = originalBroadcastChannel;
    } else {
      delete (globalThis as any).BroadcastChannel;
    }
  });

  it('broadcasts using BroadcastChannel and localStorage fallback', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    broadcastBookmarksUpdate({ touchesCollectionsList: true });

    expect(MockBroadcastChannel.postedMessages).toHaveLength(1);
    const message = MockBroadcastChannel.postedMessages[0];
    expect(message.type).toBe('BOOKMARKS_MUTATION');
    expect(message.payload.touchesCollectionsList).toBe(true);
    expect(message.payload).toEqual(
      expect.objectContaining({
        eventId: expect.any(String),
        sourceTabId: expect.any(String),
        timestamp: expect.any(Number),
      }),
    );
    expect(setItemSpy).toHaveBeenCalledWith('qdc:bookmarks-sync', JSON.stringify(message));
  });

  it('falls back to localStorage when BroadcastChannel is unavailable', () => {
    delete (globalThis as any).BroadcastChannel;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    broadcastBookmarksUpdate({ touchesBookmarksList: true });

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenCalledWith(
      'qdc:bookmarks-sync',
      expect.stringContaining('"touchesBookmarksList":true'),
    );
  });

  it('handles incoming cross-tab messages with targeted cache invalidation and guest dispatch', () => {
    isLoggedInMock.mockReturnValue(false);
    const { unmount } = renderHook(() => useBookmarksBroadcastListener());

    const externalChannel = new MockBroadcastChannel('bookmarks-sync');
    const readingBookmark = {
      id: 'bookmark-1',
      key: 2,
      type: BookmarkType.Ayah,
      verseNumber: 5,
      isReading: true,
    };
    const guestReadingBookmark = {
      key: 2,
      type: BookmarkType.Ayah,
      verseNumber: 5,
      mushafId: 4,
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    externalChannel.postMessage({
      type: 'BOOKMARKS_MUTATION',
      payload: {
        eventId: 'evt-1',
        sourceTabId: 'other-tab',
        timestamp: Date.now(),
        touchesReadingBookmark: true,
        readingBookmark,
        touchesCollectionsList: true,
        touchesBookmarksList: true,
        touchesBookmarkCollections: true,
        touchesCollectionDetail: true,
        affectedCollectionIds: ['123'],
        affectedSurahNumbers: [1, 2],
        mushafId: 4,
        guestReadingBookmark,
      },
    });

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'guestBookmark/setGuestReadingBookmark',
        payload: guestReadingBookmark,
      }),
    );
    expect(mutateMock.mock.calls.length).toBeGreaterThan(0);
    expect(mutateMock).toHaveBeenCalledWith('surah-bookmarks-4-1', undefined, { revalidate: true });
    expect(mutateMock).toHaveBeenCalledWith('surah-bookmarks-4-2', undefined, { revalidate: true });
    expect(mutateMock).toHaveBeenCalledWith('reading-bookmark-user-1-4', readingBookmark, {
      revalidate: false,
    });
    expect(mutateMock).not.toHaveBeenCalledWith('reading-bookmark-user-1-7', expect.anything(), {
      revalidate: false,
    });
    expect(mutateMock).toHaveBeenCalledWith('/api/proxy/collections/123?limit=20', undefined, {
      revalidate: true,
    });
    expect(mutateMock).not.toHaveBeenCalledWith('/api/proxy/collections/999?limit=20', undefined, {
      revalidate: true,
    });

    unmount();
  });

  it('deduplicates repeated events by eventId', () => {
    const { unmount } = renderHook(() => useBookmarksBroadcastListener());
    const externalChannel = new MockBroadcastChannel('bookmarks-sync');
    const message = {
      type: 'BOOKMARKS_MUTATION' as const,
      payload: {
        eventId: 'evt-duplicate',
        sourceTabId: 'other-tab',
        timestamp: Date.now(),
        touchesCollectionsList: true,
      },
    };

    externalChannel.postMessage(message);
    const callCountAfterFirstMessage = mutateMock.mock.calls.length;
    externalChannel.postMessage(message);

    expect(callCountAfterFirstMessage).toBeGreaterThan(0);
    expect(mutateMock).toHaveBeenCalledTimes(callCountAfterFirstMessage);
    expect(mutateMock).toHaveBeenCalledWith('/api/proxy/collections?type=ayah', undefined, {
      revalidate: true,
    });
    unmount();
  });

  it('ignores self-broadcasted events', () => {
    const { unmount } = renderHook(() => useBookmarksBroadcastListener());

    broadcastBookmarksUpdate({ touchesCollectionsList: true });

    expect(mutateMock).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
    unmount();
  });

  it('handles storage events as fallback transport', () => {
    const { unmount } = renderHook(() => useBookmarksBroadcastListener());

    const storageMessage = {
      type: 'BOOKMARKS_MUTATION',
      payload: {
        eventId: 'evt-storage-1',
        sourceTabId: 'other-tab',
        timestamp: Date.now(),
        touchesBookmarksList: true,
      },
    };

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'qdc:bookmarks-sync',
        newValue: JSON.stringify(storageMessage),
      }),
    );

    expect(mutateMock.mock.calls.length).toBeGreaterThan(0);
    expect(mutateMock).toHaveBeenCalledWith('/api/proxy/bookmarks?mushafId=4', undefined, {
      revalidate: true,
    });

    unmount();
  });
});
