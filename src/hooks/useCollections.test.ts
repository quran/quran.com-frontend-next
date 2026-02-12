/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCollections from './useCollections';

import { broadcastBookmarksUpdate } from '@/hooks/useBookmarksBroadcast';
import * as authApi from '@/utils/auth/api';
import BookmarkType from 'types/BookmarkType';
import { Collection } from 'types/Collection';

const { swrMock, swrMutateCollectionsMock, toastMock, isLoggedInMock, tMock, collectionsDataRef } =
  vi.hoisted(() => ({
    swrMock: vi.fn(),
    swrMutateCollectionsMock: vi.fn(),
    toastMock: vi.fn(),
    isLoggedInMock: vi.fn(() => ({ isLoggedIn: true })),
    tMock: vi.fn((key: string) => key),
    collectionsDataRef: {
      value: { data: [] as Collection[] },
    },
  }));

vi.mock('swr', () => ({
  default: (...args: unknown[]) => swrMock(...args),
}));

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  default: () => isLoggedInMock(),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: tMock }),
}));

vi.mock('@/components/dls/Toast/Toast', () => ({
  ToastStatus: { Error: 'error' },
  useToast: () => toastMock,
}));

vi.mock('@/hooks/useBookmarksBroadcast', () => ({
  broadcastBookmarksUpdate: vi.fn(),
}));

vi.mock('@/utils/auth/api', () => ({
  addCollection: vi.fn(),
  deleteCollection: vi.fn(),
  getCollectionsList: vi.fn(),
  updateCollection: vi.fn(),
}));

describe('useCollections', () => {
  const mockAddCollection = vi.mocked(authApi.addCollection);
  const mockUpdateCollection = vi.mocked(authApi.updateCollection);
  const mockDeleteCollection = vi.mocked(authApi.deleteCollection);

  beforeEach(() => {
    vi.clearAllMocks();
    collectionsDataRef.value = {
      data: [
        {
          id: 'old-collection',
          name: 'Old Collection',
          url: 'old-collection',
          updatedAt: '2026-01-01T00:00:00.000Z',
          bookmarksCount: 2,
        },
      ],
    };

    swrMutateCollectionsMock.mockImplementation(
      async (updater?: unknown, options?: { optimisticData?: { data: Collection[] } }) => {
        const current = collectionsDataRef.value;
        if (options?.optimisticData) {
          collectionsDataRef.value = options.optimisticData;
        }

        if (typeof updater === 'function') {
          collectionsDataRef.value = await (updater as any)(current);
        } else if (updater !== undefined) {
          collectionsDataRef.value = updater as { data: Collection[] };
        }

        return collectionsDataRef.value;
      },
    );

    swrMock.mockReturnValue({
      data: collectionsDataRef.value,
      isValidating: false,
      mutate: swrMutateCollectionsMock,
    });
  });

  it('broadcasts sync event when collection is created', async () => {
    mockAddCollection.mockResolvedValue({
      id: 'new-collection',
      name: 'New Collection',
      url: 'new-collection',
      updatedAt: '2026-01-01T00:00:00.000Z',
      bookmarksCount: 0,
    } as Collection);

    const { result } = renderHook(() => useCollections({ type: BookmarkType.Ayah }));

    await act(async () => {
      await result.current.addCollection('New Collection');
    });

    expect(broadcastBookmarksUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        touchesCollectionsList: true,
        touchesCollectionDetail: true,
        affectedCollectionIds: ['new-collection'],
      }),
    );
  });

  it('broadcasts sync event when collection is updated', async () => {
    mockUpdateCollection.mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useCollections({ type: BookmarkType.Ayah }));

    await act(async () => {
      await result.current.updateCollection('old-collection', 'Updated Name');
    });

    expect(broadcastBookmarksUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        touchesCollectionsList: true,
        touchesCollectionDetail: true,
        affectedCollectionIds: ['old-collection'],
      }),
    );
  });

  it('broadcasts sync event when collection is deleted', async () => {
    mockDeleteCollection.mockResolvedValue(undefined as never);
    const { result } = renderHook(() => useCollections({ type: BookmarkType.Ayah }));

    await act(async () => {
      await result.current.deleteCollection('old-collection');
    });

    expect(broadcastBookmarksUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        touchesCollectionsList: true,
        touchesCollectionDetail: true,
        touchesBookmarksList: true,
        touchesBookmarkCollections: true,
        affectedCollectionIds: ['old-collection'],
      }),
    );
  });

  it('does not broadcast when create collection fails', async () => {
    mockAddCollection.mockRejectedValue(new Error('failure'));
    const { result } = renderHook(() => useCollections({ type: BookmarkType.Ayah }));

    await act(async () => {
      await result.current.addCollection('Failing Collection');
    });

    expect(broadcastBookmarksUpdate).not.toHaveBeenCalled();
  });
});
