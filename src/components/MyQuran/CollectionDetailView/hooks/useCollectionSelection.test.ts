/* eslint-disable react-func/max-lines-per-function */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCollectionSelection from './useCollectionSelection';

import { logButtonClick } from '@/utils/eventLogger';

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

describe('useCollectionSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles select mode and clears selected bookmarks when exiting', () => {
    const filteredBookmarks = [{ id: 'b1' }, { id: 'b2' }] as any;
    const { result } = renderHook(() =>
      useCollectionSelection({ filteredBookmarks, numericCollectionId: '123' }),
    );

    expect(result.current.isSelectMode).toBe(false);

    act(() => result.current.toggleSelectMode());
    expect(result.current.isSelectMode).toBe(true);
    expect(logButtonClick).toHaveBeenCalledWith('collection_detail_toggle_select_mode', {
      collectionId: '123',
      isEntering: true,
    });

    act(() => result.current.handleToggleBookmarkSelection('b1'));
    expect(result.current.isBookmarkSelected('b1')).toBe(true);

    act(() => result.current.toggleSelectMode());
    expect(result.current.isSelectMode).toBe(false);
    expect(result.current.selectedBookmarks.size).toBe(0);
    expect(logButtonClick).toHaveBeenLastCalledWith('collection_detail_toggle_select_mode', {
      collectionId: '123',
      isEntering: false,
    });
  });

  it('expands and collapses all cards and logs the correct event', () => {
    const filteredBookmarks = [{ id: 'b1' }, { id: 'b2' }] as any;
    const { result } = renderHook(() =>
      useCollectionSelection({ filteredBookmarks, numericCollectionId: '123' }),
    );

    expect(result.current.isAllExpanded).toBe(false);

    act(() => result.current.handleToggleExpandCollapseAll());
    expect(result.current.isAllExpanded).toBe(true);
    expect(result.current.expandedCardIds.size).toBe(2);
    expect(logButtonClick).toHaveBeenCalledWith('collection_detail_expand_all', {
      collectionId: '123',
    });

    act(() => result.current.handleToggleExpandCollapseAll());
    expect(result.current.isAllExpanded).toBe(false);
    expect(result.current.expandedCardIds.size).toBe(0);
    expect(logButtonClick).toHaveBeenCalledWith('collection_detail_collapse_all', {
      collectionId: '123',
    });
  });
});
