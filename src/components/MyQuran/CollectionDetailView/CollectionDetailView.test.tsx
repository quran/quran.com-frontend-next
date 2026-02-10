/* eslint-disable i18next/no-literal-string */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import React from 'react';

import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CollectionDetailView from './index';

import type { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';

let swrData: GetBookmarkCollectionsIdResponse | undefined;
const swrMutate = vi.fn();

vi.mock('swr', () => ({
  default: () => ({
    data: swrData,
    error: undefined,
    mutate: swrMutate,
  }),
  useSWRConfig: () => ({ mutate: vi.fn() }),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ locale: 'en', pathname: '/', query: {}, asPath: '/' }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: (state: any) => any) =>
    selector({ quranReaderStyles: { quranFont: 'hafs', mushafLines: 16 } }),
  shallowEqual: (a: unknown, b: unknown) => a === b,
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: (state: any) => state.quranReaderStyles,
}));

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  default: () => ({ isLoggedIn: true }),
}));

vi.mock('@/hooks/useBookmarkCacheInvalidator', () => ({
  default: () => ({ invalidateAllBookmarkCaches: vi.fn() }),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Success: 'success', Error: 'error' },
  useToast: () => vi.fn(),
}));

vi.mock('@/utils/api', () => ({
  getMushafId: () => ({ mushaf: 1 }),
  ITEMS_PER_PAGE: 10,
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
  logValueChange: vi.fn(),
}));

vi.mock('@/lib/sentry', () => ({
  logErrorToSentry: vi.fn(),
}));

vi.mock('@/hooks/usePinnedVersesBroadcast', () => ({
  broadcastPinnedVerses: vi.fn(),
  PinnedVersesBroadcastType: { PIN: 'PIN' },
}));

vi.mock('@/redux/slices/QuranReader/pinnedVerses', () => ({
  pinVerses: vi.fn(() => ({ type: 'pin' })),
}));

vi.mock('@/utils/auth/api', () => ({
  deleteCollectionBookmarkById: vi.fn(),
  privateFetcher: vi.fn(),
  syncPinnedItems: vi.fn(),
}));

vi.mock('@/utils/auth/apiPaths', () => ({
  makeGetBookmarkByCollectionId: () => '/collections/1',
}));

vi.mock('@/utils/auth/pinnedItems', () => ({
  buildPinnedSyncPayload: vi.fn(),
  isPinnedItemsCacheKey: 'pinned-items',
}));

vi.mock('@/components/Collection/CollectionSorter/CollectionSorter', () => ({
  default: () => <div data-testid="collection-sorter" />,
}));

vi.mock('@/components/MyQuran/SavedTabContent/CollectionFiltersDropdown', () => ({
  default: ({
    trigger,
    selectedChapterIds,
    selectedJuzNumbers,
    onSelectedChapterIdsChange,
    onSelectedJuzNumbersChange,
  }: any) => (
    <div data-testid="collection-filters-dropdown">
      {trigger}
      <button type="button" onClick={() => onSelectedChapterIdsChange(['1'])}>
        chapter-1
      </button>
      <button type="button" onClick={() => onSelectedChapterIdsChange(['2'])}>
        chapter-2
      </button>
      <button type="button" onClick={() => onSelectedChapterIdsChange([])}>
        clear-chapters
      </button>
      <button type="button" onClick={() => onSelectedJuzNumbersChange(['1'])}>
        juz-1
      </button>
      <button type="button" onClick={() => onSelectedJuzNumbersChange(['2'])}>
        juz-2
      </button>
      <button type="button" onClick={() => onSelectedJuzNumbersChange([])}>
        clear-juz
      </button>
      <div data-testid="selected-chapters">{selectedChapterIds?.join(',') ?? ''}</div>
      <div data-testid="selected-juz">{selectedJuzNumbers?.join(',') ?? ''}</div>
    </div>
  ),
}));

vi.mock('@/components/Collection/CollectionActionsPopover/CollectionBulkActionsPopover', () => ({
  default: ({ children }: any) => <div data-testid="bulk-actions">{children}</div>,
}));

vi.mock('@/components/Collection/CollectionActionsPopover/CollectionHeaderActionsPopover', () => ({
  default: ({ children, onEditClick, onDeleteClick, onPinVersesClick, onNoteClick }: any) => (
    <div data-testid="header-actions">
      {children}
      {onEditClick && (
        <button type="button" onClick={onEditClick}>
          edit
        </button>
      )}
      {onDeleteClick && (
        <button type="button" onClick={onDeleteClick}>
          delete
        </button>
      )}
      <button type="button" onClick={onPinVersesClick}>
        pin
      </button>
      <button type="button" onClick={onNoteClick}>
        note
      </button>
    </div>
  ),
}));

vi.mock('@/components/Collection/CollectionDetail/CollectionDetail', () => ({
  default: ({ bookmarks, emptyMessage, onEndReached }: any) => (
    <div data-testid="collection-detail">
      <div data-testid="bookmarks-count">{bookmarks?.length ?? 0}</div>
      <div data-testid="first-bookmark-id">{bookmarks?.[0]?.id ?? ''}</div>
      <div data-testid="empty-message">{emptyMessage ?? ''}</div>
      {onEndReached && (
        <button type="button" onClick={onEndReached}>
          end-reached
        </button>
      )}
    </div>
  ),
}));

vi.mock('@/components/Collection/EditCollectionModal', () => ({
  default: ({ isOpen, onSubmit, onClose }: any) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <button type="button" onClick={() => onSubmit({ name: 'Updated Name' })}>
          submit-edit
        </button>
        <button type="button" onClick={onClose}>
          cancel-edit
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/MyQuran/DeleteCollectionModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="delete-modal">
        <button type="button" onClick={onConfirm}>
          confirm-delete
        </button>
        <button type="button" onClick={onCancel}>
          cancel-delete
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/Notes/modal/AddNoteModal', () => ({
  default: () => null,
}));

vi.mock('@/components/QuranReader/StudyModeContainer', () => ({
  default: () => null,
}));

vi.mock('@/components/QuranReader/VerseActionModalContainer', () => ({
  default: () => null,
}));

vi.mock('@/icons/chevron-left.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/chevron-right.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/menu_more_horiz.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/filter.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/filter-bar.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/search.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/close.svg', () => ({ default: () => <div /> }));

const buildSWRData = (collectionId: string, name: string, isOwner = true) => ({
  data: {
    collection: {
      id: collectionId,
      name,
      updatedAt: '2025-01-01T00:00:00.000Z',
      url: name.toLowerCase(),
      bookmarksCount: 0,
    },
    bookmarks: [],
    isOwner,
  },
  pagination: { hasNextPage: false },
});

const renderCollectionDetailView = (
  props: Partial<React.ComponentProps<typeof CollectionDetailView>> = {},
) => {
  const defaultProps: React.ComponentProps<typeof CollectionDetailView> = {
    collectionId: 'my-collection-123',
    collectionName: 'My Collection',
    onBack: vi.fn(),
    searchQuery: '',
    onSearchChange: vi.fn(),
    isDefault: false,
    onCollectionUpdateRequest: vi.fn(async () => true),
    onCollectionDeleteRequest: vi.fn(async () => true),
  };

  return render(<CollectionDetailView {...defaultProps} {...props} />);
};

describe('CollectionDetailView', () => {
  beforeEach(() => {
    cleanup();
    swrData = buildSWRData('123', 'My Collection');
    swrMutate.mockClear();
  });

  it('opens edit modal and submits rename', async () => {
    const onCollectionUpdateRequest = vi.fn(async () => true);

    renderCollectionDetailView({ onCollectionUpdateRequest });

    fireEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(screen.getByTestId('edit-modal')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'submit-edit' }));

    expect(onCollectionUpdateRequest).toHaveBeenCalledWith('123', 'Updated Name');
    expect(screen.queryByTestId('edit-modal')).toBeNull();
  });

  it('shows collection empty message when the collection has no bookmarks', async () => {
    swrData = buildSWRData('123', 'My Collection');

    renderCollectionDetailView();

    expect(screen.getByTestId('empty-message').textContent).toBe('collections.detail-empty');
    expect(screen.getByTestId('bookmarks-count').textContent).toBe('0');
  });

  it('sorts by date descending by default and paginates 10 items initially', async () => {
    const bookmarks = Array.from({ length: 15 }, (unused, index) => ({
      id: `b-${index}`,
      key: 2,
      verseNumber: index + 1,
      createdAt: new Date(2025, 0, index + 1).toISOString(),
      type: 'ayah',
    }));

    swrData = buildSWRData('123', 'My Collection');
    // @ts-ignore - partial shape is fine for tests
    swrData.data.bookmarks = bookmarks;

    renderCollectionDetailView();

    // first render shows 10 only.
    expect(screen.getByTestId('bookmarks-count').textContent).toBe('10');
    // default sort: newest first
    expect(screen.getByTestId('first-bookmark-id').textContent).toBe('b-14');

    // enable infinite scroll callback
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'end-reached' })).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: 'end-reached' }));

    await waitFor(() => {
      expect(screen.getByTestId('bookmarks-count').textContent).toBe('15');
    });
  });

  it('opens delete modal and confirms deletion', async () => {
    const onCollectionDeleteRequest = vi.fn(async () => true);

    renderCollectionDetailView({ onCollectionDeleteRequest });

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));
    expect(screen.getByTestId('delete-modal')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'confirm-delete' }));

    expect(onCollectionDeleteRequest).toHaveBeenCalledWith('123');
    await waitFor(() => {
      expect(screen.queryByTestId('delete-modal')).toBeNull();
    });
  });

  it('cancel buttons close modals without making changes', async () => {
    const onCollectionUpdateRequest = vi.fn(async () => true);
    const onCollectionDeleteRequest = vi.fn(async () => true);

    renderCollectionDetailView({ onCollectionUpdateRequest, onCollectionDeleteRequest });

    fireEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(screen.getByTestId('edit-modal')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'cancel-edit' }));

    expect(screen.queryByTestId('edit-modal')).toBeNull();
    expect(onCollectionUpdateRequest).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));
    expect(screen.getByTestId('delete-modal')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'cancel-delete' }));

    expect(screen.queryByTestId('delete-modal')).toBeNull();
    expect(onCollectionDeleteRequest).not.toHaveBeenCalled();
  });

  it('default collections cannot be edited or deleted', () => {
    renderCollectionDetailView({ isDefault: true });

    expect(screen.queryByRole('button', { name: 'edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'delete' })).toBeNull();
  });

  it('filters bookmarks by selected chapter', async () => {
    const bookmarks = [
      {
        id: 'b-1-early',
        key: 1,
        verseNumber: 1,
        createdAt: new Date(2025, 0, 1).toISOString(),
        type: 'ayah',
      },
      {
        id: 'b-2',
        key: 2,
        verseNumber: 1,
        createdAt: new Date(2025, 0, 2).toISOString(),
        type: 'ayah',
      },
      {
        id: 'b-1-late',
        key: 1,
        verseNumber: 2,
        createdAt: new Date(2025, 0, 3).toISOString(),
        type: 'ayah',
      },
    ];

    swrData = buildSWRData('123', 'My Collection');
    // @ts-ignore - partial shape is fine for tests
    swrData.data.bookmarks = bookmarks;

    renderCollectionDetailView();

    expect(screen.getByTestId('bookmarks-count').textContent).toBe('3');

    fireEvent.click(screen.getByRole('button', { name: 'chapter-1' }));

    await waitFor(() => {
      expect(screen.getByTestId('bookmarks-count').textContent).toBe('2');
      // default sort: newest first within filtered set
      expect(screen.getByTestId('first-bookmark-id').textContent).toBe('b-1-late');
    });

    fireEvent.click(screen.getByRole('button', { name: 'chapter-2' }));

    await waitFor(() => {
      expect(screen.getByTestId('bookmarks-count').textContent).toBe('1');
      expect(screen.getByTestId('first-bookmark-id').textContent).toBe('b-2');
    });
  });

  it('filters bookmarks by selected juz (using juz mapping)', async () => {
    // 2:142 is the start of Juz 2 in standard Qur'an partitioning.
    const bookmarks = [
      {
        id: 'b-2-1',
        key: 2,
        verseNumber: 1,
        createdAt: new Date(2025, 0, 1).toISOString(),
        type: 'ayah',
      },
      {
        id: 'b-2-142',
        key: 2,
        verseNumber: 142,
        createdAt: new Date(2025, 0, 2).toISOString(),
        type: 'ayah',
      },
      {
        id: 'b-1-1',
        key: 1,
        verseNumber: 1,
        createdAt: new Date(2025, 0, 3).toISOString(),
        type: 'ayah',
      },
    ];

    swrData = buildSWRData('123', 'My Collection');
    // @ts-ignore - partial shape is fine for tests
    swrData.data.bookmarks = bookmarks;

    renderCollectionDetailView();

    fireEvent.click(screen.getByRole('button', { name: 'juz-2' }));

    await waitFor(() => {
      expect(screen.getByTestId('bookmarks-count').textContent).toBe('1');
      expect(screen.getByTestId('first-bookmark-id').textContent).toBe('b-2-142');
    });
  });

  it('shows no-matches empty state when active filters produce no results', async () => {
    const bookmarks = [
      {
        id: 'b-1-1',
        key: 1,
        verseNumber: 1,
        createdAt: new Date(2025, 0, 1).toISOString(),
        type: 'ayah',
      },
      {
        id: 'b-2-142',
        key: 2,
        verseNumber: 142,
        createdAt: new Date(2025, 0, 2).toISOString(),
        type: 'ayah',
      },
    ];

    swrData = buildSWRData('123', 'My Collection');
    // @ts-ignore - partial shape is fine for tests
    swrData.data.bookmarks = bookmarks;

    renderCollectionDetailView();

    // Chapter 1 is in Juz 1, so combining Chapter 1 + Juz 2 yields zero matches.
    fireEvent.click(screen.getByRole('button', { name: 'chapter-1' }));
    fireEvent.click(screen.getByRole('button', { name: 'juz-2' }));

    await waitFor(() => {
      expect(screen.getByTestId('bookmarks-count').textContent).toBe('0');
      expect(screen.getByTestId('empty-message').textContent).toBe(
        'collections.filters.no-matches',
      );
    });
  });
});
