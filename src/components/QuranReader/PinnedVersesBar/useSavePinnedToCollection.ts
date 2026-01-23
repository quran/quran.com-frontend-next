import { useState, useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import { CollectionOption } from '@/components/Collection/SaveToCollectionModal/SaveToCollectionModal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useCollections from '@/hooks/useCollections';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
import { addBulkCollectionBookmarks } from '@/utils/auth/api';

interface UseSavePinnedToCollectionReturn {
  collections: CollectionOption[];
  isSaving: boolean;
  handleCollectionToggled: (collection: CollectionOption, newValue: boolean) => Promise<void>;
  handleNewCollectionCreated: (name: string) => Promise<void>;
}

const useSavePinnedToCollection = (onSaveSuccess: () => void): UseSavePinnedToCollectionReturn => {
  const { t } = useTranslation('quran-reader');
  const toast = useToast();
  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  const [isSaving, setIsSaving] = useState(false);

  const { collections, addCollection } = useCollections({
    type: BookmarkType.Ayah,
  });

  /**
   * Save all pinned verses to the selected collection using bulk API
   */
  const savePinnedVersesToCollection = useCallback(
    async (collectionId: string): Promise<boolean> => {
      try {
        setIsSaving(true);
        const bookmarks = pinnedVerses.map((pv) => ({
          key: pv.chapterNumber,
          type: BookmarkType.Ayah,
          verseNumber: pv.verseNumber,
        }));

        await addBulkCollectionBookmarks({
          collectionId,
          bookmarks,
          mushafId,
        });

        return true;
      } catch {
        toast(t('common:error.general'), { status: ToastStatus.Error });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [pinnedVerses, mushafId, toast, t],
  );

  const handleCollectionToggled = useCallback(
    async (collection: CollectionOption, newValue: boolean) => {
      if (newValue && !isSaving) {
        const success = await savePinnedVersesToCollection(collection.id);
        if (success) {
          toast(t('pinned-saved-successfully'), { status: ToastStatus.Success });
          onSaveSuccess();
        }
      }
    },
    [isSaving, savePinnedVersesToCollection, toast, t, onSaveSuccess],
  );

  const handleNewCollectionCreated = useCallback(
    async (name: string) => {
      const newCollection = await addCollection(name);
      if (newCollection) {
        const success = await savePinnedVersesToCollection(newCollection.id);
        if (success) {
          toast(t('pinned-saved-successfully'), { status: ToastStatus.Success });
        }
      }
      onSaveSuccess();
    },
    [addCollection, savePinnedVersesToCollection, toast, t, onSaveSuccess],
  );

  const modalCollections: CollectionOption[] = collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    checked: false,
  }));

  return {
    collections: modalCollections,
    isSaving,
    handleCollectionToggled,
    handleNewCollectionCreated,
  };
};

export default useSavePinnedToCollection;
