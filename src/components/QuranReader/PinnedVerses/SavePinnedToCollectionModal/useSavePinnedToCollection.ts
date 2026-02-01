import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import { CollectionItem } from '@/components/Verse/SaveBookmarkModal/Collections/CollectionsListItem';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useCollections from '@/hooks/useCollections';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
import { addBulkCollectionBookmarks } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';

const useSavePinnedToCollection = (onClose: () => void) => {
  const { t } = useTranslation('quran-reader');
  const { t: commonT } = useTranslation('common');
  const toast = useToast();
  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { collections, isLoading, addCollection } = useCollections({ type: BookmarkType.Ayah });

  const collectionItems: CollectionItem[] = collections.map((c) => ({
    id: c.id,
    name: c.name,
    checked: false,
    updatedAt: c.updatedAt,
  }));

  const savePinnedToCollection = useCallback(
    async (collectionId: string) => {
      if (isSaving) return;
      setIsSaving(true);
      try {
        const bookmarks = pinnedVerses.map((pv) => ({
          key: pv.chapterNumber,
          type: BookmarkType.Ayah,
          verseNumber: pv.verseNumber,
        }));
        await addBulkCollectionBookmarks({ collectionId, bookmarks, mushafId });
        toast(t('pinned-saved-successfully'), { status: ToastStatus.Success });
        onClose();
      } catch {
        toast(commonT('error.general'), { status: ToastStatus.Error });
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, pinnedVerses, mushafId, toast, t, commonT, onClose],
  );

  const handleCollectionToggle = useCallback(
    async (collection: CollectionItem, checked: boolean) => {
      if (checked) {
        logButtonClick('save_pinned_to_collection');
        await savePinnedToCollection(collection.id);
      }
    },
    [savePinnedToCollection],
  );

  const handleNewCollectionClick = useCallback(() => {
    logButtonClick('save_pinned_new_collection');
    setIsCreatingCollection(true);
    setNewCollectionName('');
  }, []);

  const resetNewCollection = useCallback(() => {
    setIsCreatingCollection(false);
    setNewCollectionName('');
  }, []);

  const handleCreateCollection = useCallback(async () => {
    if (!newCollectionName.trim()) return;
    setIsSubmittingCollection(true);
    try {
      const newCollection = await addCollection(newCollectionName.trim());
      if (newCollection) {
        await savePinnedToCollection(newCollection.id);
      }
      resetNewCollection();
    } catch {
      toast(commonT('error.general'), { status: ToastStatus.Error });
    } finally {
      setIsSubmittingCollection(false);
    }
  }, [
    newCollectionName,
    addCollection,
    savePinnedToCollection,
    toast,
    commonT,
    resetNewCollection,
  ]);

  return {
    collectionItems,
    isLoading,
    isSaving,
    isCreatingCollection,
    newCollectionName,
    isSubmittingCollection,
    setNewCollectionName,
    handleCollectionToggle,
    handleNewCollectionClick,
    resetNewCollection,
    handleCreateCollection,
  };
};

export default useSavePinnedToCollection;
