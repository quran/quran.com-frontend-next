import React from 'react';

import styles from './CollectionDetailView.module.scss';
import CollectionDetailViewBulkActionsBar from './CollectionDetailViewBulkActionsBar';
import CollectionDetailViewHeader from './CollectionDetailViewHeader';
import { CollectionDetailViewLayoutProps } from './CollectionDetailViewLayout.types';
import CollectionDetailViewModals from './CollectionDetailViewModals';

import CollectionDetail from '@/components/Collection/CollectionDetail/CollectionDetail';
import CollectionSorter from '@/components/Collection/CollectionSorter/CollectionSorter';
import StudyModeContainer from '@/components/QuranReader/StudyModeContainer';
import VerseActionModalContainer from '@/components/QuranReader/VerseActionModalContainer';
import { ArrowDirection } from '@/dls/Sorter/Sorter';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

const CollectionDetailViewLayout: React.FC<CollectionDetailViewLayoutProps> = ({
  collectionName,
  onBack,
  isDefault,
  lang,
  t,
  numericCollectionId,
  sortBy,
  onSortByChange,
  totalCount,
  isOwner,
  filteredBookmarks,
  onItemDeleted,
  onShareVerse,
  isSelectMode,
  isAllExpanded,
  selectedCount,
  onToggleSelectMode,
  onToggleExpandCollapseAll,
  onToggleBookmarkSelection,
  onToggleCardExpansion,
  isCardExpanded,
  isBookmarkSelected,
  onHeaderNoteClick,
  onHeaderPinAllClick,
  onHeaderEditClick,
  onHeaderDeleteClick,
  onBulkNoteClick,
  onBulkPinSelectedClick,
  onBulkCopyClick,
  onBulkDeleteClick,
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
  const sortOptions = [
    {
      id: CollectionDetailSortOption.RecentlyAdded,
      label: t('collection:recently-added'),
      direction: ArrowDirection.Down,
    },
    {
      id: CollectionDetailSortOption.VerseKey,
      label: t('collection:verse-key'),
      direction: ArrowDirection.Up,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topActions}>
        <CollectionSorter
          selectedOptionId={sortBy}
          onChange={onSortByChange}
          options={sortOptions}
          isSingleCollection
          collectionId={numericCollectionId}
        />
      </div>
      <CollectionDetailViewHeader
        collectionName={collectionName}
        totalCount={totalCount}
        lang={lang}
        t={t}
        onBack={onBack}
        isDefault={isDefault}
        onNoteClick={onHeaderNoteClick}
        onPinVersesClick={onHeaderPinAllClick}
        onEditClick={onHeaderEditClick}
        onDeleteClick={onHeaderDeleteClick}
      />
      <CollectionDetailViewBulkActionsBar
        isAllExpanded={isAllExpanded}
        isSelectMode={isSelectMode}
        isOwner={isOwner}
        lang={lang}
        selectedCount={selectedCount}
        t={t}
        onToggleExpandCollapseAll={onToggleExpandCollapseAll}
        onToggleSelectMode={onToggleSelectMode}
        onBulkNoteClick={onBulkNoteClick}
        onPinSelectedVerses={onBulkPinSelectedClick}
        onBulkCopyClick={onBulkCopyClick}
        onBulkDeleteClick={onBulkDeleteClick}
      />
      <div className={styles.separator} />
      <CollectionDetail
        id={numericCollectionId}
        title={collectionName}
        bookmarks={filteredBookmarks}
        onItemDeleted={onItemDeleted}
        onShareVerse={onShareVerse}
        isOwner={isOwner}
        onBack={onBack}
        isSelectMode={isSelectMode}
        onToggleBookmarkSelection={onToggleBookmarkSelection}
        onToggleCardExpansion={onToggleCardExpansion}
        isCardExpanded={isCardExpanded}
        isBookmarkSelected={isBookmarkSelected}
      />
      <StudyModeContainer /> <VerseActionModalContainer />
      <CollectionDetailViewModals
        collectionName={collectionName}
        shareVerseKey={shareVerseKey}
        onShareModalClose={onShareModalClose}
        isDeleteBookmarksModalOpen={isDeleteBookmarksModalOpen}
        isDeletingBookmarks={isDeletingBookmarks}
        pendingDeleteBookmarkIds={pendingDeleteBookmarkIds}
        onBulkDeleteCancel={onBulkDeleteCancel}
        onBulkDeleteConfirm={onBulkDeleteConfirm}
        isNoteModalOpen={isNoteModalOpen}
        noteModalVerseKeys={noteModalVerseKeys}
        onNoteModalClose={onNoteModalClose}
        isEditModalOpen={isEditModalOpen}
        onEditSubmit={onEditSubmit}
        onEditModalClose={onEditModalClose}
        isDeleteCollectionModalOpen={isDeleteCollectionModalOpen}
        onDeleteCollectionConfirm={onDeleteCollectionConfirm}
        onDeleteCollectionCancel={onDeleteCollectionCancel}
        isDeletingCollection={isDeletingCollection}
      />
    </div>
  );
};

export default CollectionDetailViewLayout;
