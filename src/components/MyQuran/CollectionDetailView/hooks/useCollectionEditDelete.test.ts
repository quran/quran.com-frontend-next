/* eslint-disable react-func/max-lines-per-function */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCollectionEditDelete from './useCollectionEditDelete';

import { ToastStatus } from '@/dls/Toast/Toast';
import { logButtonClick } from '@/utils/eventLogger';

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Success: 'success', Error: 'error' },
}));

describe('useCollectionEditDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens edit modal and submits update with success toast', async () => {
    const toast = vi.fn();
    const t = (k: string) => k;
    const invalidateAllBookmarkCaches = vi.fn();
    const onCollectionUpdateRequest = vi.fn(async () => true);

    const { result } = renderHook(() =>
      useCollectionEditDelete({
        numericCollectionId: '123',
        t: t as any,
        toast: toast as any,
        invalidateAllBookmarkCaches,
        onCollectionUpdateRequest,
      }),
    );

    act(() => result.current.handleEditClick());
    expect(result.current.isEditModalOpen).toBe(true);
    expect(logButtonClick).toHaveBeenCalledWith('collection_detail_edit_click', {
      collectionId: '123',
    });

    await act(async () => {
      await result.current.handleEditSubmit({ name: 'New Name' });
    });

    expect(onCollectionUpdateRequest).toHaveBeenCalledWith('123', 'New Name');
    expect(toast).toHaveBeenCalledWith('collection:edit-collection-success', {
      status: ToastStatus.Success,
    });
    expect(logButtonClick).toHaveBeenCalledWith('collection_edit_success', { collectionId: '123' });
  });

  it('shows error toast when update fails', async () => {
    const toast = vi.fn();
    const t = (k: string) => k;
    const invalidateAllBookmarkCaches = vi.fn();
    const onCollectionUpdateRequest = vi.fn(async () => false);

    const { result } = renderHook(() =>
      useCollectionEditDelete({
        numericCollectionId: '123',
        t: t as any,
        toast: toast as any,
        invalidateAllBookmarkCaches,
        onCollectionUpdateRequest,
      }),
    );

    await act(async () => {
      await result.current.handleEditSubmit({ name: 'New Name' });
    });

    expect(toast).toHaveBeenCalledWith('common:error.general', { status: ToastStatus.Error });
    expect(logButtonClick).toHaveBeenCalledWith('collection_edit_failed', { collectionId: '123' });
  });

  it('opens delete modal and confirms deletion with success', async () => {
    const toast = vi.fn();
    const t = (k: string) => k;
    const invalidateAllBookmarkCaches = vi.fn();
    const onCollectionDeleteRequest = vi.fn(async () => true);

    const { result } = renderHook(() =>
      useCollectionEditDelete({
        numericCollectionId: '123',
        t: t as any,
        toast: toast as any,
        invalidateAllBookmarkCaches,
        onCollectionDeleteRequest,
      }),
    );

    act(() => result.current.handleDeleteClick());
    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(logButtonClick).toHaveBeenCalledWith('collection_detail_delete_click', {
      collectionId: '123',
    });

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    expect(onCollectionDeleteRequest).toHaveBeenCalledWith('123');
    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(toast).toHaveBeenCalledWith('collection:delete-collection-success', {
      status: ToastStatus.Success,
    });
    expect(invalidateAllBookmarkCaches).toHaveBeenCalledTimes(1);
  });

  it('cancels delete and logs cancel event', () => {
    const toast = vi.fn();
    const t = (k: string) => k;
    const invalidateAllBookmarkCaches = vi.fn();

    const { result } = renderHook(() =>
      useCollectionEditDelete({
        numericCollectionId: '123',
        t: t as any,
        toast: toast as any,
        invalidateAllBookmarkCaches,
      }),
    );

    act(() => result.current.handleDeleteClick());
    act(() => result.current.handleDeleteModalClose());

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(logButtonClick).toHaveBeenCalledWith('collection_delete_cancel', {
      collectionId: '123',
    });
  });
});
