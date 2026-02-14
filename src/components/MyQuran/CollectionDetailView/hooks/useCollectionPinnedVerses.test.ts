/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable prettier/prettier */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCollectionPinnedVerses from './useCollectionPinnedVerses';

import { ToastStatus } from '@/dls/Toast/Toast';
import { broadcastPinnedVerses, PinnedVersesBroadcastType } from '@/hooks/usePinnedVersesBroadcast';
import { logErrorToSentry } from '@/lib/sentry';
import { pinVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { syncPinnedItems } from '@/utils/auth/api';
import { buildPinnedSyncPayload, isPinnedItemsCacheKey } from '@/utils/auth/pinnedItems';
import { logButtonClick } from '@/utils/eventLogger';

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Success: 'success', Error: 'error' },
}));

vi.mock('@/redux/slices/QuranReader/pinnedVerses', () => ({
  pinVerses: vi.fn((verseKeys: string[]) => ({ type: 'pin', payload: verseKeys })),
}));

vi.mock('@/hooks/usePinnedVersesBroadcast', () => ({
  broadcastPinnedVerses: vi.fn(),
  PinnedVersesBroadcastType: { PIN: 'PIN' },
}));

vi.mock('@/utils/auth/api', () => ({
  syncPinnedItems: vi.fn(),
}));

vi.mock('@/utils/auth/pinnedItems', () => ({
  buildPinnedSyncPayload: vi.fn((vk: string, mushafId: number) => ({ vk, mushafId })),
  isPinnedItemsCacheKey: 'pinned-items',
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

vi.mock('@/lib/sentry', () => ({
  logErrorToSentry: vi.fn(),
}));

describe('useCollectionPinnedVerses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pins all verses locally and shows success toast when logged out', async () => {
    const dispatch = vi.fn();
    const globalMutate = vi.fn(async () => undefined);
    const toast = vi.fn();
    const t = (k: string) => k;

    const filteredBookmarks = [
      { id: 'b1', key: '1', verseNumber: 1 },
      { id: 'b2', key: '2', verseNumber: 3 },
      { id: 'b3', key: '3' }, // ignored
    ] as any;

    const { result } = renderHook(() =>
      useCollectionPinnedVerses({
        dispatch: dispatch as any,
        globalMutate: globalMutate as any,
        isLoggedIn: false,
        mushafId: 7,
        toast: toast as any,
        t: t as any,
        numericCollectionId: '123',
        filteredBookmarks,
        selectedBookmarks: new Set<string>(),
      }),
    );

    await act(async () => {
      result.current.handlePinAllVerses();
    });

    expect(logButtonClick).toHaveBeenCalledWith('collection_detail_pin_all_verses', {
      collectionId: '123',
      count: 2,
    });
    expect(pinVerses).toHaveBeenCalledWith(['1:1', '2:3']);
    expect(dispatch).toHaveBeenCalledWith({ type: 'pin', payload: ['1:1', '2:3'] });
    expect(broadcastPinnedVerses).toHaveBeenCalledWith(PinnedVersesBroadcastType.PIN, {
      verseKey: '1:1',
    });
    expect(broadcastPinnedVerses).toHaveBeenCalledWith(PinnedVersesBroadcastType.PIN, {
      verseKey: '2:3',
    });
    expect(syncPinnedItems).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('quran-reader:verses-pinned', {
      status: ToastStatus.Success,
    });
  });

  it('syncs pinned verses when logged in', async () => {
    const dispatch = vi.fn();
    const globalMutate = vi.fn(async () => undefined);
    const toast = vi.fn();
    const t = (k: string) => k;

    vi.mocked(syncPinnedItems).mockResolvedValue(undefined as any);

    const filteredBookmarks = [{ id: 'b1', key: '1', verseNumber: 1 }] as any;

    const { result } = renderHook(() =>
      useCollectionPinnedVerses({
        dispatch: dispatch as any,
        globalMutate: globalMutate as any,
        isLoggedIn: true,
        mushafId: 7,
        toast: toast as any,
        t: t as any,
        numericCollectionId: '123',
        filteredBookmarks,
        selectedBookmarks: new Set<string>(),
      }),
    );

    await act(async () => {
      result.current.handlePinAllVerses();
    });

    expect(buildPinnedSyncPayload).toHaveBeenCalledWith('1:1', 7);
    expect(syncPinnedItems).toHaveBeenCalledWith([{ vk: '1:1', mushafId: 7 }]);
    expect(globalMutate).toHaveBeenCalledWith(isPinnedItemsCacheKey, undefined, {
      revalidate: true,
    });
  });

  it('shows retryable error toast when sync fails', async () => {
    const dispatch = vi.fn();
    const globalMutate = vi.fn(async () => undefined);
    const toast = vi.fn();
    const t = (k: string) => k;

    vi.mocked(syncPinnedItems).mockRejectedValue(new Error('sync-failed'));

    const filteredBookmarks = [{ id: 'b1', key: '1', verseNumber: 1 }] as any;

    const { result } = renderHook(() =>
      useCollectionPinnedVerses({
        dispatch: dispatch as any,
        globalMutate: globalMutate as any,
        isLoggedIn: true,
        mushafId: 7,
        toast: toast as any,
        t: t as any,
        numericCollectionId: '123',
        filteredBookmarks,
        selectedBookmarks: new Set<string>(),
      }),
    );

    await act(async () => {
      result.current.handlePinAllVerses();
    });

    expect(logErrorToSentry).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('common:error.general', {
      status: ToastStatus.Error,
      actions: [expect.objectContaining({ text: 'common:retry', onClick: expect.any(Function) })],
    });
  });
});
