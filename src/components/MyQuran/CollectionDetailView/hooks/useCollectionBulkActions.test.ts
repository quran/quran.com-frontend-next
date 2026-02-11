/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildBulkCopyBlobPromise, deleteBookmarks } from './bulkActionsUtils';
import useCollectionBulkActions from './useCollectionBulkActions';

import { ToastStatus } from '@/dls/Toast/Toast';
import copyText from '@/utils/copyText';

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Success: 'success', Error: 'error' },
}));

vi.mock('@/utils/copyText', () => ({
  default: vi.fn(),
}));

vi.mock('./bulkActionsUtils', async () => {
  const actual = await vi.importActual<any>('./bulkActionsUtils');
  return {
    ...actual,
    buildBulkCopyBlobPromise: vi.fn(),
    deleteBookmarks: vi.fn(),
  };
});

describe('useCollectionBulkActions', () => {
  const t = (k: string) => k;
  const chaptersData = {} as any;
  const lang = 'en';
  const selectedTranslations = [20];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets and clears shareVerseKey', () => {
    const toast = vi.fn();
    const { result } = renderHook(() =>
      useCollectionBulkActions({
        chaptersData,
        lang,
        t: t as any,
        toast: toast as any,
        numericCollectionId: '123',
        filteredBookmarks: [],
        selectedBookmarks: new Set(),
        selectedTranslations,
        onUpdated: vi.fn(),
        removeBookmarkIdsFromState: vi.fn(),
      }),
    );

    act(() => result.current.handleShareVerse('1:1'));
    expect(result.current.shareVerseKey).toBe('1:1');

    act(() => result.current.handleShareModalClose());
    expect(result.current.shareVerseKey).toBe(null);
  });

  it('bulk copy calls copyText and shows success toast', async () => {
    const toast = vi.fn();
    vi.mocked(buildBulkCopyBlobPromise).mockResolvedValue(new Blob(['x']) as any);
    vi.mocked(copyText).mockResolvedValue(undefined as any);

    const { result } = renderHook(() =>
      useCollectionBulkActions({
        chaptersData,
        lang,
        t: t as any,
        toast: toast as any,
        numericCollectionId: '123',
        filteredBookmarks: [{ id: 'b1', key: '1', verseNumber: 1 }] as any,
        selectedBookmarks: new Set(['b1']),
        selectedTranslations,
        onUpdated: vi.fn(),
        removeBookmarkIdsFromState: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleBulkCopyClick();
    });

    expect(buildBulkCopyBlobPromise).toHaveBeenCalledTimes(1);
    expect(copyText).toHaveBeenCalledWith(expect.any(Promise));
    expect(toast).toHaveBeenCalledWith('common:copied!', { status: ToastStatus.Success });
  });

  it('bulk copy shows error toast when copy fails', async () => {
    const toast = vi.fn();
    vi.mocked(buildBulkCopyBlobPromise).mockResolvedValue(new Blob(['x']) as any);
    vi.mocked(copyText).mockRejectedValue(new Error('clipboard'));

    const { result } = renderHook(() =>
      useCollectionBulkActions({
        chaptersData,
        lang,
        t: t as any,
        toast: toast as any,
        numericCollectionId: '123',
        filteredBookmarks: [{ id: 'b1', key: '1', verseNumber: 1 }] as any,
        selectedBookmarks: new Set(['b1']),
        selectedTranslations,
        onUpdated: vi.fn(),
        removeBookmarkIdsFromState: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleBulkCopyClick();
    });

    expect(toast).toHaveBeenCalledWith('common:error.general', { status: ToastStatus.Error });
  });

  it('copy all calls copyText with filtered bookmarks and shows success toast', async () => {
    const toast = vi.fn();
    const filteredBookmarks = [
      { id: 'b1', key: '1', verseNumber: 1 },
      { id: 'b2', key: '1', verseNumber: 2 },
    ] as any;
    vi.mocked(buildBulkCopyBlobPromise).mockResolvedValue(new Blob(['x']) as any);
    vi.mocked(copyText).mockResolvedValue(undefined as any);

    const { result } = renderHook(() =>
      useCollectionBulkActions({
        chaptersData,
        lang,
        t: t as any,
        toast: toast as any,
        numericCollectionId: '123',
        filteredBookmarks,
        selectedBookmarks: new Set(),
        selectedTranslations,
        onUpdated: vi.fn(),
        removeBookmarkIdsFromState: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleCopyAllClick();
    });

    expect(buildBulkCopyBlobPromise).toHaveBeenCalledTimes(1);
    expect(buildBulkCopyBlobPromise).toHaveBeenCalledWith(
      expect.objectContaining({ selectedBookmarks: filteredBookmarks }),
    );
    expect(copyText).toHaveBeenCalledWith(expect.any(Promise));
    expect(toast).toHaveBeenCalledWith('common:copied!', { status: ToastStatus.Success });
  });

  it('copy all is a no-op when filtered bookmarks are empty', async () => {
    const toast = vi.fn();

    const { result } = renderHook(() =>
      useCollectionBulkActions({
        chaptersData,
        lang,
        t: t as any,
        toast: toast as any,
        numericCollectionId: '123',
        filteredBookmarks: [],
        selectedBookmarks: new Set(['b1']),
        selectedTranslations,
        onUpdated: vi.fn(),
        removeBookmarkIdsFromState: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleCopyAllClick();
    });

    expect(buildBulkCopyBlobPromise).not.toHaveBeenCalled();
    expect(copyText).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });

  it('copy all shows error toast when copy fails', async () => {
    const toast = vi.fn();
    vi.mocked(buildBulkCopyBlobPromise).mockResolvedValue(new Blob(['x']) as any);
    vi.mocked(copyText).mockRejectedValue(new Error('clipboard'));

    const { result } = renderHook(() =>
      useCollectionBulkActions({
        chaptersData,
        lang,
        t: t as any,
        toast: toast as any,
        numericCollectionId: '123',
        filteredBookmarks: [{ id: 'b1', key: '1', verseNumber: 1 }] as any,
        selectedBookmarks: new Set(),
        selectedTranslations,
        onUpdated: vi.fn(),
        removeBookmarkIdsFromState: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleCopyAllClick();
    });

    expect(toast).toHaveBeenCalledWith('common:error.general', { status: ToastStatus.Error });
  });

  it('bulk delete confirm removes deleted ids and keeps failed ids pending', async () => {
    const toast = vi.fn();
    const onUpdated = vi.fn();
    const removeBookmarkIdsFromState = vi.fn();

    vi.mocked(deleteBookmarks).mockResolvedValue({
      deletedIds: ['b1'],
      failedIds: ['b2'],
    } as any);

    const { result } = renderHook(() =>
      useCollectionBulkActions({
        chaptersData,
        lang,
        t: t as any,
        toast: toast as any,
        numericCollectionId: '123',
        filteredBookmarks: [
          { id: 'b1', key: '1', verseNumber: 1 },
          { id: 'b2', key: '1', verseNumber: 2 },
        ] as any,
        selectedBookmarks: new Set(['b1', 'b2']),
        selectedTranslations,
        onUpdated,
        removeBookmarkIdsFromState,
      }),
    );

    act(() => result.current.handleBulkDeleteClick());
    expect(result.current.isDeleteBookmarksModalOpen).toBe(true);
    expect(result.current.pendingDeleteBookmarkIds.sort()).toEqual(['b1', 'b2']);

    await act(async () => {
      await result.current.handleBulkDeleteConfirm();
    });

    expect(removeBookmarkIdsFromState).toHaveBeenCalledWith(['b1']);
    expect(onUpdated).toHaveBeenCalledTimes(1);
    expect(result.current.pendingDeleteBookmarkIds).toEqual(['b2']);
    expect(result.current.isDeleteBookmarksModalOpen).toBe(true);
    expect(toast).toHaveBeenCalledWith('common:error.general', { status: ToastStatus.Error });
  });
});
