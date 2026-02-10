import React from 'react';

import DeleteBookmarkModal from '@/components/Collection/DeleteBookmarkModal/DeleteBookmarkModal';
import EditCollectionModal from '@/components/Collection/EditCollectionModal';
import DeleteCollectionModal from '@/components/MyQuran/DeleteCollectionModal';
import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import ShareQuranModal from '@/components/QuranReader/ReadingView/ShareQuranModal';

interface CollectionDetailViewModalsProps {
  collectionName: string;
  shareVerseKey: string | null;
  onShareModalClose: () => void;
  isDeleteBookmarksModalOpen: boolean;
  isDeletingBookmarks: boolean;
  pendingDeleteBookmarkIds: string[];
  onBulkDeleteCancel: () => void;
  onBulkDeleteConfirm: () => void;
  isNoteModalOpen: boolean;
  noteModalVerseKeys: string[];
  onNoteModalClose: () => void;
  isEditModalOpen: boolean;
  onEditSubmit: (formData: { name: string }) => Promise<void>;
  onEditModalClose: () => void;
  isDeleteCollectionModalOpen: boolean;
  onDeleteCollectionConfirm: () => void;
  onDeleteCollectionCancel: () => void;
  isDeletingCollection: boolean;
}

const CollectionDetailViewModals: React.FC<CollectionDetailViewModalsProps> = ({
  collectionName,
  shareVerseKey,
  onShareModalClose,
  isDeleteBookmarksModalOpen,
  isDeletingBookmarks,
  pendingDeleteBookmarkIds,
  onBulkDeleteCancel,
  onBulkDeleteConfirm,
  isNoteModalOpen,
  noteModalVerseKeys,
  onNoteModalClose,
  isEditModalOpen,
  onEditSubmit,
  onEditModalClose,
  isDeleteCollectionModalOpen,
  onDeleteCollectionConfirm,
  onDeleteCollectionCancel,
  isDeletingCollection,
}) => {
  return (
    <>
      <ShareQuranModal
        isOpen={!!shareVerseKey}
        onClose={onShareModalClose}
        verse={shareVerseKey ? { verseKey: shareVerseKey } : undefined}
      />

      <DeleteBookmarkModal
        isOpen={isDeleteBookmarksModalOpen}
        isLoading={isDeletingBookmarks}
        count={pendingDeleteBookmarkIds.length}
        collectionName={collectionName}
        onCancel={onBulkDeleteCancel}
        onConfirm={onBulkDeleteConfirm}
      />

      <AddNoteModal
        showRanges
        isModalOpen={isNoteModalOpen}
        onModalClose={onNoteModalClose}
        onMyNotes={onNoteModalClose}
        verseKeys={noteModalVerseKeys}
      />

      <EditCollectionModal
        isOpen={isEditModalOpen}
        defaultValue={collectionName}
        onSubmit={onEditSubmit}
        onClose={onEditModalClose}
      />

      <DeleteCollectionModal
        isOpen={isDeleteCollectionModalOpen}
        collectionName={collectionName}
        onConfirm={onDeleteCollectionConfirm}
        onCancel={onDeleteCollectionCancel}
        isLoading={isDeletingCollection}
      />
    </>
  );
};

export default CollectionDetailViewModals;
