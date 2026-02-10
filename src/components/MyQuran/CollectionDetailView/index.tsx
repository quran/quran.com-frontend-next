/* eslint-disable react/jsx-handler-names */
import React from 'react';

import styles from './CollectionDetailView.module.scss';
import CollectionDetailViewLayout from './CollectionDetailViewLayout';
import useCollectionDetailViewController from './hooks/useCollectionDetailViewController';

import Error from '@/components/Error';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';

interface CollectionDetailViewProps {
  collectionId: string;
  collectionName: string;
  onBack: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDefault?: boolean;
  onCollectionUpdateRequest?: (collectionId: string, newName: string) => Promise<boolean>;
  onCollectionDeleteRequest?: (collectionId: string) => Promise<boolean>;
}

const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  collectionId,
  collectionName,
  onBack,
  searchQuery,
  onSearchChange,
  isDefault,
  onCollectionUpdateRequest,
  onCollectionDeleteRequest,
}) => {
  const controller = useCollectionDetailViewController({
    collectionId,
    collectionName,
    searchQuery,
    onSearchChange,
    isDefault,
    onCollectionUpdateRequest,
    onCollectionDeleteRequest,
  });

  if (controller.error) {
    return (
      <div className={styles.statusContainer}>
        <Error onRetryClicked={() => controller.mutate()} error={controller.error} />
      </div>
    );
  }

  if (!controller.data) {
    return (
      <div className={styles.statusContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  return (
    <CollectionDetailViewLayout
      collectionName={controller.collectionName}
      onBack={onBack}
      isDefault={controller.isDefault}
      lang={controller.lang}
      t={controller.t}
      numericCollectionId={controller.numericCollectionId}
      sortBy={controller.sortBy}
      onSortByChange={controller.onSortByChange}
      totalCount={controller.totalCount}
      isOwner={controller.isOwner}
      emptyMessage={controller.emptyMessage}
      filteredBookmarks={controller.filteredBookmarks}
      onItemDeleted={controller.onItemDeleted}
      onShareVerse={controller.handleShareVerse}
      isSelectMode={controller.isSelectMode}
      isAllExpanded={controller.isAllExpanded}
      selectedCount={controller.selectedBookmarks.size}
      onToggleSelectMode={controller.toggleSelectMode}
      onToggleExpandCollapseAll={controller.handleToggleExpandCollapseAll}
      onToggleBookmarkSelection={controller.handleToggleBookmarkSelection}
      onToggleCardExpansion={controller.handleToggleCardExpansion}
      isCardExpanded={controller.isCardExpanded}
      isBookmarkSelected={controller.isBookmarkSelected}
      onHeaderNoteClick={controller.handleNoteClick}
      onHeaderPinAllClick={controller.handlePinAllVerses}
      onHeaderEditClick={controller.handleEditClick}
      onHeaderDeleteClick={controller.handleDeleteClick}
      onBulkNoteClick={controller.handleBulkNoteClick}
      onBulkPinSelectedClick={controller.handlePinSelectedVerses}
      onBulkCopyClick={controller.handleBulkCopyClick}
      onBulkDeleteClick={controller.handleBulkDeleteClick}
      shareVerseKey={controller.shareVerseKey}
      onShareModalClose={controller.handleShareModalClose}
      isDeleteBookmarksModalOpen={controller.isDeleteBookmarksModalOpen}
      isDeletingBookmarks={controller.isDeletingBookmarks}
      pendingDeleteBookmarkIds={controller.pendingDeleteBookmarkIds}
      onBulkDeleteCancel={controller.handleBulkDeleteModalClose}
      onBulkDeleteConfirm={controller.handleBulkDeleteConfirm}
      isNoteModalOpen={controller.isNoteModalOpen}
      noteModalVerseKeys={controller.noteModalVerseKeys}
      onNoteModalClose={controller.handleNoteModalClose}
      isEditModalOpen={controller.isEditModalOpen}
      onEditSubmit={controller.handleEditSubmit}
      onEditModalClose={controller.handleEditModalClose}
      isDeleteCollectionModalOpen={controller.isDeleteModalOpen}
      onDeleteCollectionConfirm={controller.handleDeleteConfirm}
      onDeleteCollectionCancel={controller.handleDeleteModalClose}
      isDeletingCollection={controller.isDeleting}
      chapterItems={controller.chapterItems}
      juzItems={controller.juzItems}
      selectedChapterIds={controller.selectedChapterIds}
      selectedJuzNumbers={controller.selectedJuzNumbers}
      onSelectedChapterIdsChange={controller.onSelectedChapterIdsChange}
      onSelectedJuzNumbersChange={controller.onSelectedJuzNumbersChange}
      activeChapterChips={controller.activeChapterChips}
      activeJuzChips={controller.activeJuzChips}
      hasActiveFilters={controller.hasActiveFilters}
      onRemoveChapterFilter={controller.onRemoveChapterFilter}
      onRemoveJuzFilter={controller.onRemoveJuzFilter}
      onClearAllFilters={controller.onClearAllFilters}
    />
  );
};

export default CollectionDetailView;
