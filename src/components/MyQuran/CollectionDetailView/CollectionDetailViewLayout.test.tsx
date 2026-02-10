/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CollectionDetailViewLayout from './CollectionDetailViewLayout';

let headerProps: any;
let bulkProps: any;
let modalsProps: any;
let detailProps: any;
let sorterProps: any;

vi.mock('./CollectionDetailViewHeader', () => ({
  default: (props: any) => {
    headerProps = props;
    return null;
  },
}));

vi.mock('./CollectionDetailViewBulkActionsBar', () => ({
  default: (props: any) => {
    bulkProps = props;
    return null;
  },
}));

vi.mock('./CollectionDetailViewModals', () => ({
  default: (props: any) => {
    modalsProps = props;
    return null;
  },
}));

vi.mock('@/components/Collection/CollectionDetail/CollectionDetail', () => ({
  default: (props: any) => {
    detailProps = props;
    return null;
  },
}));

vi.mock('@/components/Collection/CollectionSorter/CollectionSorter', () => ({
  default: (props: any) => {
    sorterProps = props;
    return null;
  },
}));

vi.mock('@/components/QuranReader/StudyModeContainer', () => ({
  default: () => null,
}));

vi.mock('@/components/QuranReader/VerseActionModalContainer', () => ({
  default: () => null,
}));

describe('CollectionDetailViewLayout', () => {
  beforeEach(() => {
    headerProps = undefined;
    bulkProps = undefined;
    modalsProps = undefined;
    detailProps = undefined;
    sorterProps = undefined;
  });

  it('passes through props to composed components', () => {
    const t = (k: string) => k;

    render(
      <CollectionDetailViewLayout
        collectionName="My Collection"
        onBack={vi.fn()}
        isDefault={false}
        lang="en"
        t={t as any}
        numericCollectionId="123"
        sortBy={'verse_key' as any}
        onSortByChange={vi.fn()}
        totalCount={2}
        isOwner
        filteredBookmarks={[{ id: 'b1' } as any]}
        onItemDeleted={vi.fn()}
        onShareVerse={vi.fn()}
        isSelectMode
        isAllExpanded={false}
        selectedCount={1}
        onToggleSelectMode={vi.fn()}
        onToggleExpandCollapseAll={vi.fn()}
        onToggleBookmarkSelection={vi.fn()}
        onToggleCardExpansion={vi.fn()}
        isCardExpanded={vi.fn(() => false)}
        isBookmarkSelected={vi.fn(() => false)}
        onHeaderNoteClick={vi.fn()}
        onHeaderPinAllClick={vi.fn()}
        onHeaderEditClick={vi.fn()}
        onHeaderDeleteClick={vi.fn()}
        onBulkNoteClick={vi.fn()}
        onBulkPinSelectedClick={vi.fn()}
        onBulkCopyClick={vi.fn()}
        onBulkDeleteClick={vi.fn()}
        shareVerseKey="1:1"
        onShareModalClose={vi.fn()}
        isDeleteBookmarksModalOpen={false}
        isDeletingBookmarks={false}
        pendingDeleteBookmarkIds={[]}
        onBulkDeleteCancel={vi.fn()}
        onBulkDeleteConfirm={vi.fn()}
        isNoteModalOpen={false}
        noteModalVerseKeys={[]}
        onNoteModalClose={vi.fn()}
        isEditModalOpen={false}
        onEditSubmit={vi.fn(async () => undefined)}
        onEditModalClose={vi.fn()}
        isDeleteCollectionModalOpen={false}
        onDeleteCollectionConfirm={vi.fn()}
        onDeleteCollectionCancel={vi.fn()}
        isDeletingCollection={false}
      />,
    );

    expect(sorterProps.collectionId).toBe('123');
    expect(headerProps.collectionName).toBe('My Collection');
    expect(headerProps.totalCount).toBe(2);
    expect(bulkProps.selectedCount).toBe(1);
    expect(detailProps.bookmarks).toEqual([{ id: 'b1' }]);
    expect(modalsProps.shareVerseKey).toBe('1:1');
  });
});
