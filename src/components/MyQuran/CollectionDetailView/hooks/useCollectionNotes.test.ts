/* eslint-disable react-func/max-lines-per-function */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCollectionNotes from './useCollectionNotes';

import { logButtonClick } from '@/utils/eventLogger';

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

describe('useCollectionNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens note modal for all bookmarks (header action)', () => {
    const filteredBookmarks = [
      { id: 'b1', key: '1', verseNumber: 1 },
      { id: 'b2', key: '2', verseNumber: 3 },
    ] as any;
    const selectedBookmarks = new Set<string>(['b2']);

    const { result } = renderHook(() =>
      useCollectionNotes({ filteredBookmarks, selectedBookmarks, numericCollectionId: '123' }),
    );

    act(() => result.current.handleNoteClick());

    expect(result.current.isNoteModalOpen).toBe(true);
    expect(result.current.noteModalVerseKeys).toEqual(['1:1', '2:3']);
    expect(logButtonClick).toHaveBeenCalledWith('collection_detail_note_click', {
      collectionId: '123',
      selectedCount: 1,
      isBulkAction: false,
    });
  });

  it('opens note modal for selected bookmarks only (bulk action)', () => {
    const filteredBookmarks = [
      { id: 'b1', key: '1', verseNumber: 1 },
      { id: 'b2', key: '2', verseNumber: 3 },
    ] as any;
    const selectedBookmarks = new Set<string>(['b2']);

    const { result } = renderHook(() =>
      useCollectionNotes({ filteredBookmarks, selectedBookmarks, numericCollectionId: '123' }),
    );

    act(() => result.current.handleBulkNoteClick());

    expect(result.current.isNoteModalOpen).toBe(true);
    expect(result.current.noteModalVerseKeys).toEqual(['2:3']);
    expect(logButtonClick).toHaveBeenCalledWith('collection_detail_bulk_note_click', {
      collectionId: '123',
      selectedCount: 1,
    });

    act(() => result.current.handleNoteModalClose());
    expect(result.current.isNoteModalOpen).toBe(false);
    expect(result.current.noteModalVerseKeys).toEqual([]);
  });
});
