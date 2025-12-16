import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import BookmarkType from '@/types/BookmarkType';
import { WordVerse } from '@/types/Word';
import { logButtonClick, logEvent } from '@/utils/eventLogger';

interface UseNewCollectionFormParams {
  verse: WordVerse | undefined;
  mushafId: number;
  verseKey: string;
  onMutateData: () => void;
}

interface UseNewCollectionFormReturn {
  isCreatingCollection: boolean;
  newCollectionName: string;
  isSubmittingCollection: boolean;
  setNewCollectionName: (name: string) => void;
  handleNewCollectionClick: () => void;
  handleBackFromNewCollection: () => void;
  handleCancelNewCollection: () => void;
  handleCreateCollection: () => Promise<void>;
}

/**
 * Custom hook for managing new collection form state and handlers
 * @param {UseNewCollectionFormParams} params Form parameters
 * @returns {UseNewCollectionFormReturn} Form state and handlers
 */
export const useNewCollectionForm = ({
  verse,
  mushafId,
  verseKey,
  onMutateData,
}: UseNewCollectionFormParams): UseNewCollectionFormReturn => {
  const { t } = useTranslation('quran-reader');
  const commonT = useTranslation('common').t;
  const toast = useToast();

  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);

  const handleNewCollectionClick = useCallback((): void => {
    logButtonClick('save_bookmark_modal_new_collection');
    setIsCreatingCollection(true);
    setNewCollectionName('');
  }, []);

  const handleBackFromNewCollection = useCallback((): void => {
    setIsCreatingCollection(false);
    setNewCollectionName('');
  }, []);

  const handleCancelNewCollection = useCallback((): void => {
    setIsCreatingCollection(false);
    setNewCollectionName('');
  }, []);

  const handleCreateCollection = useCallback(async (): Promise<void> => {
    if (!newCollectionName.trim() || !verse) return;

    setIsSubmittingCollection(true);
    try {
      const { addCollection, addCollectionBookmark } = await import('@/utils/auth/api');
      const newCollection = await addCollection(newCollectionName.trim());
      await addCollectionBookmark({
        key: Number(verse.chapterId),
        mushaf: mushafId,
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
        collectionId: (newCollection as { id: string }).id,
      });
      toast(t('saved-to', { collectionName: newCollectionName.trim() }), {
        status: ToastStatus.Success,
      });
      logEvent('collection_created_and_ayah_added', {
        verseKey,
        collectionName: newCollectionName.trim(),
      });
      onMutateData();
      setIsCreatingCollection(false);
      setNewCollectionName('');
    } catch (error) {
      toast(commonT('error.general'), { status: ToastStatus.Error });
    } finally {
      setIsSubmittingCollection(false);
    }
  }, [newCollectionName, verse, mushafId, verseKey, onMutateData, toast, t, commonT]);

  return {
    isCreatingCollection,
    newCollectionName,
    isSubmittingCollection,
    setNewCollectionName,
    handleNewCollectionClick,
    handleBackFromNewCollection,
    handleCancelNewCollection,
    handleCreateCollection,
  };
};
