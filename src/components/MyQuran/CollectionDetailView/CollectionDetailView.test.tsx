/* eslint-disable i18next/no-literal-string */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import React from 'react';

import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CollectionDetailView from './index';

import { deleteCollectionBookmarkById } from '@/utils/auth/api';
import copyText from '@/utils/copyText';
import type { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';

let swrData: GetBookmarkCollectionsIdResponse | undefined;
const swrMutate = vi.fn();
const invalidateAllBookmarkCaches = vi.fn();

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
  default: () => ({ invalidateAllBookmarkCaches }),
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

vi.mock('@/utils/copyText', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/components/Collection/CollectionDetail/utils/fetchVerseForCopy', () => ({
  default: vi.fn(async () => ({})),
}));

vi.mock('@/components/Collection/CollectionDetail/utils/buildVerseCopyText', () => ({
  default: vi.fn(() => 'mock verse copy text'),
}));

vi.mock('@/utils/blob', () => ({
  textToBlob: vi.fn((text: string) => new Blob([text], { type: 'text/plain' })),
}));

vi.mock('@/utils/chapter', () => ({
  getChapterData: vi.fn(() => ({ id: 1, nameSimple: 'Al-Fatihah' })),
}));

vi.mock('@/utils/navigation', () => ({
  QURAN_URL: 'https://quran.com',
  getVerseNavigationUrlByVerseKey: vi.fn(() => '/1/1'),
}));

vi.mock('@/utils/auth/pinnedItems', () => ({
  buildPinnedSyncPayload: vi.fn(),
  isPinnedItemsCacheKey: 'pinned-items',
}));

vi.mock('@/components/Collection/CollectionSorter/CollectionSorter', () => ({
  default: () => <div data-testid="collection-sorter" />,
}));

vi.mock('@/components/Collection/CollectionActionsPopover/CollectionBulkActionsPopover', () => ({
  default: ({ children, onCopyClick, onDeleteClick }: any) => (
    <div data-testid="bulk-actions">
      {children}
      {onCopyClick && (
        <button type="button" onClick={onCopyClick}>
          bulk-copy
        </button>
      )}
      {onDeleteClick && (
        <button type="button" onClick={onDeleteClick}>
          bulk-delete
        </button>
      )}
    </div>
  ),
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
  default: ({ bookmarks, onToggleBookmarkSelection }: any) => (
    <div data-testid="collection-detail">
      {(bookmarks || []).map((b: any) => (
        <button key={b.id} type="button" onClick={() => onToggleBookmarkSelection(b.id)}>
          {`toggle-${b.id}`}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/Collection/DeleteBookmarkModal/DeleteBookmarkModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="delete-bookmarks-modal">
        <button type="button" onClick={onConfirm}>
          confirm-bulk-delete
        </button>
        <button type="button" onClick={onCancel}>
          cancel-bulk-delete
        </button>
      </div>
    ) : null,
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

vi.mock('@/components/QuranReader/ReadingView/ShareQuranModal', () => ({
  default: () => null,
}));

vi.mock('@/components/QuranReader/VerseActionModalContainer', () => ({
  default: () => null,
}));

vi.mock('@/icons/chevron-left.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/menu_more_horiz.svg', () => ({ default: () => <div /> }));

const buildSWRData = (
  collectionId: string,
  name: string,
  isOwner = true,
  bookmarks: any[] = [],
) => ({
  data: {
    collection: {
      id: collectionId,
      name,
      updatedAt: '2025-01-01T00:00:00.000Z',
      url: name.toLowerCase(),
      bookmarksCount: 0,
    },
    bookmarks,
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
    invalidateAllBookmarkCaches.mockClear();
    vi.mocked(copyText).mockClear();
    vi.mocked(deleteCollectionBookmarkById).mockClear();
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

  it('triggers bulk copy and calls copyText', async () => {
    swrData = buildSWRData('123', 'My Collection', true, [
      { id: 'b1', key: '1', verseNumber: 1 },
      { id: 'b2', key: '1', verseNumber: 2 },
    ]);

    renderCollectionDetailView();

    fireEvent.click(screen.getByRole('button', { name: 'bulk-actions.select' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle-b1' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle-b2' }));

    fireEvent.click(await screen.findByRole('button', { name: 'bulk-copy' }));

    await waitFor(() => {
      expect(copyText).toHaveBeenCalledTimes(1);
    });
  });

  it('confirms bulk delete and deletes selected bookmarks + refreshes caches', async () => {
    swrData = buildSWRData('123', 'My Collection', true, [
      { id: 'b1', key: '1', verseNumber: 1 },
      { id: 'b2', key: '1', verseNumber: 2 },
    ]);
    vi.mocked(deleteCollectionBookmarkById).mockResolvedValue(undefined as any);

    renderCollectionDetailView();

    fireEvent.click(screen.getByRole('button', { name: 'bulk-actions.select' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle-b1' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle-b2' }));

    fireEvent.click(await screen.findByRole('button', { name: 'bulk-delete' }));
    expect(screen.getByTestId('delete-bookmarks-modal')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'confirm-bulk-delete' }));

    await waitFor(() => {
      expect(deleteCollectionBookmarkById).toHaveBeenCalledWith('123', 'b1');
      expect(deleteCollectionBookmarkById).toHaveBeenCalledWith('123', 'b2');
      expect(swrMutate).toHaveBeenCalled();
      expect(invalidateAllBookmarkCaches).toHaveBeenCalled();
      expect(screen.queryByTestId('delete-bookmarks-modal')).toBeNull();
    });
  });
});
