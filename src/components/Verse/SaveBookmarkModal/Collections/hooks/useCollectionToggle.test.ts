/* eslint-disable react-func/max-lines-per-function */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCollectionToggle } from './useCollectionToggle';

import { broadcastBookmarksUpdate } from '@/hooks/useBookmarksBroadcast';
import BookmarkType from '@/types/BookmarkType';
import { addCollectionBookmark, deleteCollectionBookmarkByKey } from '@/utils/auth/api';

const { toastMock, getVerseBookmarkMock, updateVerseBookmarkMock, onMutateMock } = vi.hoisted(
  () => ({
    toastMock: vi.fn(),
    getVerseBookmarkMock: vi.fn(),
    updateVerseBookmarkMock: vi.fn(),
    onMutateMock: vi.fn(),
  }),
);

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: Record<string, string>) => `${key}:${params?.collectionName || ''}`,
  }),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Success: 'success', Error: 'error' },
  useToast: () => toastMock,
}));

vi.mock('@/hooks/auth/useSurahBookmarks', () => ({
  default: () => ({
    getVerseBookmark: getVerseBookmarkMock,
    updateVerseBookmark: updateVerseBookmarkMock,
  }),
}));

vi.mock('@/hooks/useBookmarksBroadcast', () => ({
  broadcastBookmarksUpdate: vi.fn(),
}));

vi.mock('@/utils/auth/api', () => ({
  addCollectionBookmark: vi.fn(),
  deleteCollectionBookmarkByKey: vi.fn(),
}));

vi.mock('@/utils/eventLogger', () => ({
  logEvent: vi.fn(),
}));

describe('useCollectionToggle', () => {
  const baseParams = {
    verse: { chapterId: '2', verseNumber: 255 } as any,
    mushafId: 4,
    bookmarkCollectionIdsData: [] as string[],
    verseKey: '2:255',
    mutateResourceBookmark: vi.fn(),
    mutateBookmarkCollectionIdsData: vi.fn(),
    onMutate: onMutateMock,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getVerseBookmarkMock.mockReturnValue({
      id: 'bookmark-id',
      key: 2,
      type: BookmarkType.Ayah,
      verseNumber: 255,
      isInDefaultCollection: false,
      collectionsCount: 1,
    });
    vi.mocked(addCollectionBookmark).mockResolvedValue({
      bookmark: {
        id: 'bookmark-id',
        key: 2,
        type: BookmarkType.Ayah,
        verseNumber: 255,
      },
    } as any);
    vi.mocked(deleteCollectionBookmarkByKey).mockResolvedValue({
      deleted: false,
      bookmark: {
        id: 'bookmark-id',
        key: 2,
        type: BookmarkType.Ayah,
        verseNumber: 255,
      },
    } as any);
  });

  it('broadcasts sync event when verse is added to a collection', async () => {
    const { result } = renderHook(() => useCollectionToggle(baseParams));

    await act(async () => {
      await result.current.handleToggleCollection('collection-1', 'Collection 1', false);
    });

    expect(addCollectionBookmark).toHaveBeenCalledWith(
      expect.objectContaining({
        collectionId: 'collection-1',
        key: 2,
        mushafId: 4,
        type: BookmarkType.Ayah,
        verseNumber: 255,
      }),
    );
    expect(broadcastBookmarksUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        touchesCollectionsList: true,
        touchesBookmarksList: true,
        touchesBookmarkCollections: true,
        touchesCollectionDetail: true,
        affectedCollectionIds: ['collection-1'],
        affectedSurahNumbers: [2],
        mushafId: 4,
      }),
    );
    expect(onMutateMock).toHaveBeenCalledTimes(1);
  });

  it('broadcasts sync event when verse is removed from a collection', async () => {
    const { result } = renderHook(() =>
      useCollectionToggle({
        ...baseParams,
        bookmarkCollectionIdsData: ['collection-1'],
      }),
    );

    await act(async () => {
      await result.current.handleToggleCollection('collection-1', 'Collection 1', true);
    });

    expect(deleteCollectionBookmarkByKey).toHaveBeenCalledWith(
      expect.objectContaining({
        collectionId: 'collection-1',
        key: 2,
        mushafId: 4,
        type: BookmarkType.Ayah,
        verseNumber: 255,
      }),
    );
    expect(broadcastBookmarksUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        touchesCollectionsList: true,
        touchesBookmarksList: true,
        touchesBookmarkCollections: true,
        touchesCollectionDetail: true,
        affectedCollectionIds: ['collection-1'],
        affectedSurahNumbers: [2],
        mushafId: 4,
      }),
    );
    expect(onMutateMock).toHaveBeenCalledTimes(1);
  });

  it('does not broadcast sync event when add operation fails', async () => {
    vi.mocked(addCollectionBookmark).mockRejectedValue(new Error('failed'));
    const { result } = renderHook(() => useCollectionToggle(baseParams));

    await act(async () => {
      await result.current.handleToggleCollection('collection-1', 'Collection 1', false);
    });

    expect(broadcastBookmarksUpdate).not.toHaveBeenCalled();
    expect(onMutateMock).not.toHaveBeenCalled();
  });
});
