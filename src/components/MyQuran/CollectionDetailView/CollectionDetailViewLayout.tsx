/* eslint-disable max-lines */
import React, { useState } from 'react';

import styles from './CollectionDetailView.module.scss';
import CollectionDetailViewBulkActionsBar from './CollectionDetailViewBulkActionsBar';
import CollectionDetailViewHeader from './CollectionDetailViewHeader';
import { CollectionDetailViewLayoutProps } from './CollectionDetailViewLayout.types';
import CollectionDetailViewModals from './CollectionDetailViewModals';

import CollectionDetail from '@/components/Collection/CollectionDetail/CollectionDetail';
import CollectionSorter from '@/components/Collection/CollectionSorter/CollectionSorter';
import ActiveFiltersChips from '@/components/MyQuran/SavedTabContent/ActiveFiltersChips';
import CollectionFiltersDropdown from '@/components/MyQuran/SavedTabContent/CollectionFiltersDropdown';
import StudyModeContainer from '@/components/QuranReader/StudyModeContainer';
import VerseActionModalContainer from '@/components/QuranReader/VerseActionModalContainer';
import { ArrowDirection } from '@/dls/Sorter/Sorter';
import FilterIcon from '@/icons/filter-bar.svg';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

const CollectionDetailViewLayout: React.FC<CollectionDetailViewLayoutProps> = ({
  collectionName,
  onBack,
  isDefault,
  isFetchingAll,
  lang,
  t,
  numericCollectionId,
  sortBy,
  onSortByChange,
  totalCount,
  isOwner,
  emptyMessage,
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
  chapterItems,
  juzItems,
  selectedChapterIds,
  selectedJuzNumbers,
  onSelectedChapterIdsChange,
  onSelectedJuzNumbersChange,
  activeChapterChips,
  activeJuzChips,
  hasActiveFilters,
  onRemoveChapterFilter,
  onRemoveJuzFilter,
  onClearAllFilters,
}) => {
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = useState(false);

  const sortOptions = [
    {
      id: CollectionDetailSortOption.DateDesc,
      label: t('collection:date-desc'),
      direction: ArrowDirection.Down,
    },
    {
      id: CollectionDetailSortOption.DateAsc,
      label: t('collection:date-asc'),
      direction: ArrowDirection.Up,
    },
    {
      id: CollectionDetailSortOption.QuranicOrderAsc,
      label: t('collection:quranic-asc'),
      direction: ArrowDirection.Up,
    },
    {
      id: CollectionDetailSortOption.QuranicOrderDesc,
      label: t('collection:quranic-desc'),
      direction: ArrowDirection.Down,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.searchAndActions}>
        <div className={styles.searchSpacer} aria-hidden="true" />

        <div className={styles.topActions}>
          <CollectionFiltersDropdown
            isOpen={isFiltersDropdownOpen}
            onOpenChange={setIsFiltersDropdownOpen}
            trigger={
              <button type="button" className={styles.filterButton} aria-label={t('search.filter')}>
                <FilterIcon className={styles.filterIcon} />
                <span className={styles.filterText}>{t('search.filter')}</span>
                {hasActiveFilters && <span className={styles.activeDot} />}
              </button>
            }
            chapterItems={chapterItems}
            juzItems={juzItems}
            selectedChapterIds={selectedChapterIds}
            selectedJuzNumbers={selectedJuzNumbers}
            onSelectedChapterIdsChange={onSelectedChapterIdsChange}
            onSelectedJuzNumbersChange={onSelectedJuzNumbersChange}
          />

          <CollectionSorter
            selectedOptionId={sortBy}
            onChange={onSortByChange}
            options={sortOptions}
            isSingleCollection
            collectionId={numericCollectionId}
          />
        </div>
      </div>

      <ActiveFiltersChips
        chapters={activeChapterChips}
        juz={activeJuzChips}
        onRemoveChapter={onRemoveChapterFilter}
        onRemoveJuz={onRemoveJuzFilter}
        onClearAll={onClearAllFilters}
      />

      <CollectionDetailViewHeader
        collectionName={collectionName}
        totalCount={totalCount}
        lang={lang}
        t={t}
        onBack={onBack}
        isDefault={isDefault}
        isFetchingAll={isFetchingAll}
        onNoteClick={onHeaderNoteClick}
        onPinVersesClick={onHeaderPinAllClick}
        onEditClick={onHeaderEditClick}
        onDeleteClick={onHeaderDeleteClick}
      />
      <CollectionDetailViewBulkActionsBar
        isAllExpanded={isAllExpanded}
        isSelectMode={isSelectMode}
        isOwner={isOwner}
        isFetchingAll={isFetchingAll}
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
        emptyMessage={emptyMessage}
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
      <StudyModeContainer />
      <VerseActionModalContainer />
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
