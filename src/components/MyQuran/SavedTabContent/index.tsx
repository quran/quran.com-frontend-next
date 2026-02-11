/* eslint-disable max-lines */
import React, { useMemo, useState, useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SavedTabContent.module.scss';

import CollectionDetailView from '@/components/MyQuran/CollectionDetailView';
import CollectionsList from '@/components/MyQuran/CollectionsList';
import MyReadingBookmark from '@/components/MyQuran/MyReadingBookmark';
import RecentlySaved from '@/components/MyQuran/RecentlySaved';
import NewCollectionForm from '@/components/Verse/SaveBookmarkModal/Collections/NewCollectionForm';
import Modal from '@/dls/Modal/Modal';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useCollections, { CollectionSortOption, CollectionItem } from '@/hooks/useCollections';
import useReadingBookmarkDisplay from '@/hooks/useReadingBookmarkDisplay';
import useRecentlySaved from '@/hooks/useRecentlySaved';
import BookmarkType from '@/types/BookmarkType';

const SavedTabContent: React.FC = () => {
  const { isLoggedIn } = useIsLoggedIn();
  const { t } = useTranslation('my-quran');
  const { bookmark, isLoading: isBookmarkLoading } = useReadingBookmarkDisplay();
  const { items: recentlySavedItems, isLoading: isRecentlySavedLoading } = useRecentlySaved();
  const {
    collections,
    isLoading: isCollectionsLoading,
    addCollection,
    updateCollection,
    deleteCollection: deleteCollectionFromHook,
  } = useCollections({
    type: BookmarkType.Ayah,
  });

  const [sortBy, setSortBy] = useState<CollectionSortOption>(CollectionSortOption.RECENTLY_UPDATED);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionItem | null>(null);

  const onNewCollectionClick = useCallback(() => setIsNewCollectionModalOpen(true), []);
  const onCollectionClick = useCallback((c: CollectionItem) => {
    setSearchQuery('');
    setSelectedCollection(c);
  }, []);
  const onBackToCollections = useCallback(() => setSelectedCollection(null), []);

  const onNewCollectionCreated = useCallback(async () => {
    if (!newCollectionName.trim()) return;
    setIsSubmittingCollection(true);
    const newCollection = await addCollection(newCollectionName);
    setIsSubmittingCollection(false);
    if (newCollection) {
      setIsNewCollectionModalOpen(false);
      setNewCollectionName('');
    }
  }, [addCollection, newCollectionName]);

  const onCollectionUpdateRequest = useCallback(
    async (collectionId: string, newName: string) => {
      const success = await updateCollection(collectionId, newName);
      if (success) {
        setSelectedCollection((prev) =>
          prev?.id === collectionId ? { ...prev, name: newName } : prev,
        );
      }
      return success;
    },
    [updateCollection],
  );

  const onCollectionDeleteRequest = useCallback(
    async (collectionId: string) => {
      const success = await deleteCollectionFromHook(collectionId);
      if (success) setSelectedCollection(null);
      return success;
    },
    [deleteCollectionFromHook],
  );

  const collectionItems: CollectionItem[] = useMemo(
    () =>
      collections.map((collection) => ({
        id: collection.id,
        name: collection.isDefault ? t('collections.favorites') : collection.name,
        itemCount: collection.bookmarksCount || collection.count,
        updatedAt: collection.updatedAt,
        isDefault: collection.isDefault,
      })),
    [collections, t],
  );

  const selectedCollectionName = useMemo(() => {
    if (!selectedCollection) return '';
    return selectedCollection.isDefault ? t('collections.favorites') : selectedCollection.name;
  }, [selectedCollection, t]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collectionItems;
    const query = searchQuery.toLowerCase();
    return collectionItems.filter((collection) => collection.name.toLowerCase().includes(query));
  }, [collectionItems, searchQuery]);

  const filteredRecentlySaved = useMemo(() => {
    if (!searchQuery.trim()) return recentlySavedItems;
    const query = searchQuery.toLowerCase();
    return recentlySavedItems.filter(
      (item) =>
        item.verseKey.toLowerCase().includes(query) ||
        item.surahNumber.toString().includes(query) ||
        item.ayahNumber.toString().includes(query),
    );
  }, [recentlySavedItems, searchQuery]);

  // Show recently saved only for logged-in users with items
  const showRecentlySaved =
    isLoggedIn && (isRecentlySavedLoading || filteredRecentlySaved.length > 0);

  return (
    <div className={styles.container}>
      {!selectedCollection && (
        <MyReadingBookmark bookmark={bookmark} isLoading={isBookmarkLoading} />
      )}

      {selectedCollection ? (
        <CollectionDetailView
          collectionId={selectedCollection.id}
          collectionName={selectedCollectionName}
          onBack={onBackToCollections}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isDefault={selectedCollection.isDefault}
          onCollectionUpdateRequest={onCollectionUpdateRequest}
          onCollectionDeleteRequest={onCollectionDeleteRequest}
        />
      ) : (
        <>
          {showRecentlySaved && (
            <RecentlySaved items={filteredRecentlySaved} isLoading={isRecentlySavedLoading} />
          )}

          <CollectionsList
            collections={filteredCollections}
            isLoading={isCollectionsLoading}
            isGuest={!isLoggedIn}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onNewCollectionClick={onNewCollectionClick}
            onCollectionClick={onCollectionClick}
          />
        </>
      )}

      <Modal isOpen={isNewCollectionModalOpen} onClose={() => setIsNewCollectionModalOpen(false)}>
        <NewCollectionForm
          newCollectionName={newCollectionName}
          isSubmittingCollection={isSubmittingCollection}
          onNameChange={setNewCollectionName}
          onBack={() => setIsNewCollectionModalOpen(false)}
          onCancel={() => setIsNewCollectionModalOpen(false)}
          onCreate={onNewCollectionCreated}
          onClose={() => setIsNewCollectionModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default SavedTabContent;
