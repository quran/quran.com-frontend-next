/* eslint-disable react-func/max-lines-per-function */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCollectionDetailData from './useCollectionDetailData';

import { privateFetcher } from '@/utils/auth/api';
import { makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { logValueChange } from '@/utils/eventLogger';

let swrData: any;
const mutate = vi.fn();

vi.mock('swr', () => ({
  default: vi.fn(() => ({ data: swrData, mutate, error: undefined })),
}));

vi.mock('@/utils/auth/api', () => ({
  privateFetcher: vi.fn(),
}));

vi.mock('@/utils/auth/apiPaths', () => ({
  makeGetBookmarkByCollectionId: vi.fn(() => '/collections/123'),
}));

vi.mock('@/utils/eventLogger', () => ({
  logValueChange: vi.fn(),
}));

vi.mock('@/utils/string', () => ({
  slugifiedCollectionIdToCollectionId: vi.fn(() => '123'),
}));

describe('useCollectionDetailData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    swrData = {
      data: {
        bookmarks: [
          { id: 'b1', key: '1', verseNumber: 1 },
          { id: 'b2', key: '2', verseNumber: 10 },
        ],
      },
    };
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
    const { result, rerender } = renderHook((props: any) => useCollectionDetailData(props), {
      initialProps: {
        collectionId: 'my-collection-123',
        searchQuery: '2:10',
        invalidateAllBookmarkCaches: vi.fn(),
      },
    });

    expect(result.current.filteredBookmarks.map((b: any) => b.id)).toEqual(['b2']);

    rerender({
      collectionId: 'my-collection-123',
      searchQuery: '1:1',
      invalidateAllBookmarkCaches: vi.fn(),
    });
    expect(result.current.filteredBookmarks.map((b: any) => b.id)).toEqual(['b1']);
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
    act(() => result.current.onSortByChange('recently_added' as any));
    expect(logValueChange).toHaveBeenCalledWith(
      'collection_detail_page_sort_by',
      prev,
      'recently_added',
    );
    expect(result.current.sortBy).toBe('recently_added');
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
});
