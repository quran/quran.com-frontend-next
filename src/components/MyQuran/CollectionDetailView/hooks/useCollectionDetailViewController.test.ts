import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCollectionDetailViewController from './useCollectionDetailViewController';

import { ToastStatus } from '@/dls/Toast/Toast';
import { deleteCollectionBookmarkById } from '@/utils/auth/api';

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Success: 'success', Error: 'error' },
}));

vi.mock('@/utils/auth/api', () => ({
  deleteCollectionBookmarkById: vi.fn(),
}));

const toast = vi.fn();
const t = vi.fn((key: string, query?: Record<string, unknown>) => `${key}:${query?.count ?? ''}`);

vi.mock('./useCollectionDetailViewDeps', () => ({
  default: () => ({
    t,
    lang: 'en',
    toast,
    chaptersData: {},
    invalidateAllBookmarkCaches: vi.fn(),
    isLoggedIn: true,
    globalMutate: vi.fn(),
    dispatch: vi.fn(),
    mushafId: 7,
    selectedTranslations: [20],
  }),
}));

const onUpdated = vi.fn();

vi.mock('./useCollectionDetailData', () => ({
  default: () => ({
    numericCollectionId: '123',
    sortBy: 'verse_key',
    onSortByChange: vi.fn(),
    data: { data: { bookmarks: [{ id: 'b1' }, { id: 'b2' }], isOwner: true } },
    mutate: vi.fn(),
    error: undefined,
    bookmarks: [{ id: 'b1' }, { id: 'b2' }],
    filteredBookmarks: [{ id: 'b1' }, { id: 'b2' }],
    onUpdated,
  }),
}));

vi.mock('./useCollectionSelection', () => ({
  default: () => ({
    isSelectMode: false,
    selectedBookmarks: new Set(),
    isAllExpanded: false,
    toggleSelectMode: vi.fn(),
    handleToggleExpandCollapseAll: vi.fn(),
    handleToggleBookmarkSelection: vi.fn(),
    handleToggleCardExpansion: vi.fn(),
    removeBookmarkIdsFromState: vi.fn(),
    isCardExpanded: vi.fn(() => false),
    isBookmarkSelected: vi.fn(() => false),
  }),
}));

vi.mock('./useCollectionNotes', () => ({
  default: () => ({
    isNoteModalOpen: false,
    noteModalVerseKeys: [],
    handleNoteClick: vi.fn(),
    handleBulkNoteClick: vi.fn(),
    handleNoteModalClose: vi.fn(),
  }),
}));

vi.mock('./useCollectionEditDelete', () => ({
  default: () => ({
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    isDeleting: false,
    handleEditClick: vi.fn(),
    handleDeleteClick: vi.fn(),
    handleEditSubmit: vi.fn(),
    handleEditModalClose: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    handleDeleteModalClose: vi.fn(),
  }),
}));

vi.mock('./useCollectionPinnedVerses', () => ({
  default: () => ({
    handlePinAllVerses: vi.fn(),
    handlePinSelectedVerses: vi.fn(),
  }),
}));

vi.mock('./useCollectionBulkActions', () => ({
  default: () => ({
    shareVerseKey: null,
    handleShareVerse: vi.fn(),
    handleShareModalClose: vi.fn(),
    isDeleteBookmarksModalOpen: false,
    isDeletingBookmarks: false,
    pendingDeleteBookmarkIds: [],
    handleBulkCopyClick: vi.fn(),
    handleBulkDeleteClick: vi.fn(),
    handleBulkDeleteModalClose: vi.fn(),
    handleBulkDeleteConfirm: vi.fn(),
  }),
}));

describe('useCollectionDetailViewController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('onItemDeleted calls API, refreshes data, and shows success toast', async () => {
    vi.mocked(deleteCollectionBookmarkById).mockResolvedValue(undefined as unknown as void);

    const { result } = renderHook(() =>
      useCollectionDetailViewController({ collectionId: 'slug', collectionName: 'Name' }),
    );

    result.current.onItemDeleted('b1');
    await new Promise((r) => {
      setTimeout(r, 0);
    });

    expect(deleteCollectionBookmarkById).toHaveBeenCalledWith('123', 'b1');
    expect(onUpdated).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('collection:delete-bookmark.success:1', {
      status: ToastStatus.Success,
    });
  });

  it('onItemDeleted shows error toast when API fails', async () => {
    vi.mocked(deleteCollectionBookmarkById).mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() =>
      useCollectionDetailViewController({ collectionId: 'slug', collectionName: 'Name' }),
    );

    result.current.onItemDeleted('b1');
    await new Promise((r) => {
      setTimeout(r, 0);
    });

    expect(toast).toHaveBeenCalledWith('common:error.general:', { status: ToastStatus.Error });
  });
});
