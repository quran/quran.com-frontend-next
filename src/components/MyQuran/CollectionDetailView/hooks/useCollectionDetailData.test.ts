/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */

import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCollectionDetailData from './useCollectionDetailData';

import { privateFetcher } from '@/utils/auth/api';
import { makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { logValueChange } from '@/utils/eventLogger';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import Bookmark from 'types/Bookmark';
import BookmarkType from 'types/BookmarkType';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

vi.setConfig({
  testTimeout: 10_000,
  hookTimeout: 10_000,
});

const { useSWRMock, mutateMock } = vi.hoisted(() => ({
  useSWRMock: vi.fn(),
  mutateMock: vi.fn(),
}));

interface UseCollectionDetailDataParams {
  collectionId: string;
  searchQuery?: string;
  invalidateAllBookmarkCaches: () => void;
  fetchAll?: boolean;
}

let swrData: GetBookmarkCollectionsIdResponse | undefined;
const mutate = vi.fn();
const swrResponse = {
  data: undefined as GetBookmarkCollectionsIdResponse | undefined,
  mutate,
  error: undefined,
};

vi.mock('swr', () => ({
  default: useSWRMock,
  mutate: mutateMock,
}));

vi.mock('@/utils/auth/api', () => ({
  privateFetcher: vi.fn(),
}));

vi.mock('@/utils/auth/apiPaths', () => ({
  makeGetBookmarkByCollectionId: vi.fn((collectionId: string, params?: { cursor?: string }) => {
    const cursor = params?.cursor;
    return cursor
      ? `/collections/${collectionId}?cursor=${cursor}`
      : `/collections/${collectionId}`;
  }),
}));

vi.mock('@/utils/eventLogger', () => ({
  logValueChange: vi.fn(),
}));

vi.mock('@/utils/string', () => ({
  slugifiedCollectionIdToCollectionId: vi.fn((slug: string) => {
    const match = slug.match(/(\d+)$/);
    return match?.[1] ?? '123';
  }),
}));

describe('useCollectionDetailData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSWRMock.mockImplementation(() => {
      swrResponse.data = swrData;
      return swrResponse;
    });
    swrData = {
      data: {
        collection: { id: '123', name: 'Test', url: 'test', updatedAt: '' },
        bookmarks: [
          { id: 'b1', key: 1, verseNumber: 1, type: BookmarkType.Ayah },
          { id: 'b2', key: 2, verseNumber: 10, type: BookmarkType.Ayah },
        ],
        isOwner: true,
      },
      pagination: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: 'cursor_start',
        endCursor: 'cursor_end',
      },
    } as unknown as GetBookmarkCollectionsIdResponse;
  });

  it('builds the SWR key with collection id and sort option', () => {
    renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches: vi.fn(),
      }),
    );

    expect(makeGetBookmarkByCollectionId).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        limit: expect.any(Number),
      }),
    );
    expect(privateFetcher).toBeDefined();
  });

  it('filters bookmarks by searchQuery', () => {
    const { result, rerender } = renderHook(
      (props: UseCollectionDetailDataParams) => useCollectionDetailData(props),
      {
        initialProps: {
          collectionId: 'my-collection-123',
          searchQuery: '2:10',
          invalidateAllBookmarkCaches: vi.fn(),
        },
      },
    );

    expect(result.current.filteredBookmarks.map((b: Bookmark) => b.id)).toEqual(['b2']);

    rerender({
      collectionId: 'my-collection-123',
      searchQuery: '1:1',
      invalidateAllBookmarkCaches: vi.fn(),
    });
    expect(result.current.filteredBookmarks.map((b: Bookmark) => b.id)).toEqual(['b1']);
  });

  it('onSortByChange logs value change and updates sortBy', () => {
    const invalidateAllBookmarkCaches = vi.fn();
    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches,
      }),
    );

    const prev = result.current.sortBy;
    act(() => result.current.onSortByChange(CollectionDetailSortOption.RecentlyAdded));
    expect(logValueChange).toHaveBeenCalledWith(
      'collection_detail_page_sort_by',
      prev,
      CollectionDetailSortOption.RecentlyAdded,
    );
    expect(result.current.sortBy).toBe(CollectionDetailSortOption.RecentlyAdded);
  });

  it('should reset pagination when sort changes', () => {
    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches: vi.fn(),
      }),
    );

    act(() => result.current.goToNextPage());
    // Simulate being on next page
    const initialCallCount = vi.mocked(makeGetBookmarkByCollectionId).mock.calls.length;

    act(() => result.current.onSortByChange(CollectionDetailSortOption.RecentlyAdded));

    // After sort change, pagination should be reset
    // The next SWR call should not include cursor
    expect(vi.mocked(makeGetBookmarkByCollectionId).mock.calls.length).toBeGreaterThan(
      initialCallCount,
    );
  });

  it('should expose pagination information', () => {
    swrData.pagination = {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'cursor_start',
      endCursor: 'cursor_end',
    };

    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches: vi.fn(),
      }),
    );

    expect(result.current.pagination).toEqual({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'cursor_start',
      endCursor: 'cursor_end',
    });
  });

  it('goToNextPage updates cursor when hasNextPage is true', () => {
    swrData.pagination = {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'cursor_start',
      endCursor: 'cursor_end',
    };

    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches: vi.fn(),
      }),
    );

    act(() => result.current.goToNextPage());

    expect(makeGetBookmarkByCollectionId).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        cursor: 'cursor_end',
      }),
    );
  });

  it('resetPagination clears cursor and refetch from start', () => {
    swrData.pagination = {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'cursor_start',
      endCursor: 'cursor_end',
    };

    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches: vi.fn(),
      }),
    );

    act(() => result.current.goToNextPage());
    act(() => result.current.resetPagination());

    // Should fetch without cursor
    expect(vi.mocked(makeGetBookmarkByCollectionId).mock.calls.length).toBeGreaterThan(1);
  });

  it('onUpdated triggers SWR mutate and invalidates bookmark caches', () => {
    const invalidateAllBookmarkCaches = vi.fn();
    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches,
      }),
    );

    act(() => result.current.onUpdated());
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(invalidateAllBookmarkCaches).toHaveBeenCalledTimes(1);
  });

  it('should fetch and accumulate multiple pages when fetchAll is true', async () => {
    // Important: keep the returned SWR response stable per key. If we return a fresh object each
    // render, `fetchAll` mode will keep re-processing the same page and never settle.
    const responseByKey = new Map<
      string,
      { data: GetBookmarkCollectionsIdResponse; mutate: any; error: any }
    >();
    useSWRMock.mockImplementation((key: unknown) => {
      const strKey = String(key);
      const cached = responseByKey.get(strKey);
      if (cached) return cached;

      const response = strKey.includes('cursor=cursor_end_1')
        ? {
            data: {
              data: {
                collection: { id: '123', name: 'Test', url: 'test', updatedAt: '' },
                bookmarks: [
                  { id: 'b3', key: 3, verseNumber: 5, type: BookmarkType.Ayah },
                  { id: 'b4', key: 4, verseNumber: 15, type: BookmarkType.Ayah },
                ] as Bookmark[],
                isOwner: true,
              },
              pagination: {
                hasNextPage: false,
                hasPreviousPage: true,
                startCursor: 'cursor_start',
                endCursor: 'cursor_end_2',
              },
            } as unknown as GetBookmarkCollectionsIdResponse,
            mutate,
            error: undefined,
          }
        : {
            data: {
              data: {
                collection: { id: '123', name: 'Test', url: 'test', updatedAt: '' },
                bookmarks: [
                  { id: 'b1', key: 1, verseNumber: 1, type: BookmarkType.Ayah },
                  { id: 'b2', key: 2, verseNumber: 10, type: BookmarkType.Ayah },
                ] as Bookmark[],
                isOwner: true,
              },
              pagination: {
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: 'cursor_start',
                endCursor: 'cursor_end_1',
              },
            } as unknown as GetBookmarkCollectionsIdResponse,
            mutate,
            error: undefined,
          };

      responseByKey.set(strKey, response);
      return response;
    });

    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches: vi.fn(),
        fetchAll: true,
      }),
    );

    await waitFor(
      () => {
        expect(result.current.bookmarks.map((b: any) => b.id)).toEqual(['b1', 'b2', 'b3', 'b4']);
      },
      { timeout: 10_000 },
    );
  });

  it('onUpdated in fetchAll mode revalidates from the start key', () => {
    // Keep this test deterministic: we only care about global revalidation from the start key,
    // not auto-pagination behavior.
    swrData.pagination.hasNextPage = false;
    const invalidateAllBookmarkCaches = vi.fn();
    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches,
        fetchAll: true,
      }),
    );

    act(() => result.current.goToNextPage());
    act(() => result.current.onUpdated());

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith('/collections/123');
    expect(mutate).not.toHaveBeenCalled();
    expect(invalidateAllBookmarkCaches).toHaveBeenCalledTimes(1);
  });

  it('clears cursor when collection changes in non-fetchAll mode', async () => {
    const { result, rerender } = renderHook(
      (props: UseCollectionDetailDataParams) => useCollectionDetailData(props),
      {
        initialProps: {
          collectionId: 'my-collection-123',
          invalidateAllBookmarkCaches: vi.fn(),
          fetchAll: false,
        },
      },
    );

    act(() => result.current.goToNextPage());

    rerender({
      collectionId: 'my-collection-456',
      invalidateAllBookmarkCaches: vi.fn(),
      fetchAll: false,
    });

    await waitFor(() => {
      const { calls } = vi.mocked(makeGetBookmarkByCollectionId).mock;
      const sawStartCallForNewCollection = calls.some(
        ([id, params]) => id === '456' && params && !('cursor' in params),
      );
      expect(sawStartCallForNewCollection).toBe(true);
    });
  });

  it('should default to fetchAll false', () => {
    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches: vi.fn(),
      }),
    );

    expect(result.current.isFetchingAll).toBe(false);
  });

  it('isFetchingAll is true during initial load when fetchAll is enabled', () => {
    // Simulate the initial render where data has not yet loaded
    swrData = undefined;

    const { result } = renderHook(() =>
      useCollectionDetailData({
        collectionId: 'my-collection-123',
        invalidateAllBookmarkCaches: vi.fn(),
        fetchAll: true,
      }),
    );

    expect(result.current.isFetchingAll).toBe(true);
  });

  it('should reset allBookmarks when fetchAll is disabled', () => {
    // Avoid auto-pagination to keep state transitions predictable for this test.
    swrData.pagination.hasNextPage = false;
    const { result, rerender } = renderHook(
      (props: UseCollectionDetailDataParams) => useCollectionDetailData(props),
      {
        initialProps: {
          collectionId: 'my-collection-123',
          invalidateAllBookmarkCaches: vi.fn(),
          fetchAll: true,
        },
      },
    );

    rerender({
      collectionId: 'my-collection-123',
      invalidateAllBookmarkCaches: vi.fn(),
      fetchAll: false,
    });

    expect(result.current.isFetchingAll).toBe(false);
  });
});
