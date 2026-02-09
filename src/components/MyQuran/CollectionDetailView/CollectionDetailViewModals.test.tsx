/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CollectionDetailViewModals from './CollectionDetailViewModals';

let shareProps: any;
let deleteBookmarksProps: any;
let noteProps: any;
let editProps: any;
let deleteCollectionProps: any;

vi.mock('@/components/QuranReader/ReadingView/ShareQuranModal', () => ({
  default: (props: any) => {
    shareProps = props;
    return null;
  },
}));

vi.mock('@/components/Collection/DeleteBookmarkModal/DeleteBookmarkModal', () => ({
  default: (props: any) => {
    deleteBookmarksProps = props;
    return null;
  },
}));

vi.mock('@/components/Notes/modal/AddNoteModal', () => ({
  default: (props: any) => {
    noteProps = props;
    return null;
  },
}));

vi.mock('@/components/Collection/EditCollectionModal', () => ({
  default: (props: any) => {
    editProps = props;
    return null;
  },
}));

vi.mock('@/components/MyQuran/DeleteCollectionModal', () => ({
  default: (props: any) => {
    deleteCollectionProps = props;
    return null;
  },
}));

describe('CollectionDetailViewModals', () => {
  beforeEach(() => {
    shareProps = undefined;
    deleteBookmarksProps = undefined;
    noteProps = undefined;
    editProps = undefined;
    deleteCollectionProps = undefined;
  });

  it('wires modal open/close props correctly', () => {
    render(
      <CollectionDetailViewModals
        collectionName="My Collection"
        shareVerseKey="1:1"
        onShareModalClose={vi.fn()}
        isDeleteBookmarksModalOpen
        isDeletingBookmarks
        pendingDeleteBookmarkIds={['b1', 'b2']}
        onBulkDeleteCancel={vi.fn()}
        onBulkDeleteConfirm={vi.fn()}
        isNoteModalOpen
        noteModalVerseKeys={['1:1']}
        onNoteModalClose={vi.fn()}
        isEditModalOpen
        onEditSubmit={vi.fn(async () => undefined)}
        onEditModalClose={vi.fn()}
        isDeleteCollectionModalOpen
        onDeleteCollectionConfirm={vi.fn()}
        onDeleteCollectionCancel={vi.fn()}
        isDeletingCollection
      />,
    );

    expect(shareProps.isOpen).toBe(true);
    expect(shareProps.verse).toEqual({ verseKey: '1:1' });
    expect(deleteBookmarksProps.isOpen).toBe(true);
    expect(deleteBookmarksProps.count).toBe(2);
    expect(noteProps.isModalOpen).toBe(true);
    expect(noteProps.verseKeys).toEqual(['1:1']);
    expect(editProps.isOpen).toBe(true);
    expect(editProps.defaultValue).toBe('My Collection');
    expect(deleteCollectionProps.isOpen).toBe(true);
    expect(deleteCollectionProps.isLoading).toBe(true);
  });
});
