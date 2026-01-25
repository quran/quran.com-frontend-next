import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import BookmarkType from '@/types/BookmarkType';
import { Collection } from '@/types/Collection';
import Verse from '@/types/Verse';
import { addCollection, addCollectionBookmark } from '@/utils/auth/api';
import { logButtonClick, logEvent } from '@/utils/eventLogger';

interface CollectionCreationHelpers {
  handleNewCollectionClick: () => void;
  handleBackFromNewCollection: () => void;
  handleCancelNewCollection: () => void;
  handleCreateCollection: () => Promise<void>;
}

interface UseCollectionCreationParams {
  verse: Verse | undefined;
  mushafId: number;
  verseKey: string;
  newCollectionName: string;
  onStateChange: (state: {
    isCreatingCollection?: boolean;
    newCollectionName?: string;
    isSubmittingCollection?: boolean;
  }) => void;
  onMutate: () => void;
}

/**
 * Custom hook to manage collection creation logic
 * Handles creating new collections and adding verses to them
 * @param {UseCollectionCreationParams} params Collection creation parameters
 * @returns {CollectionCreationHelpers} Object with handlers for collection creation flow
 */
export const useCollectionCreation = ({
  verse,
  mushafId,
  verseKey,
  newCollectionName,
  onStateChange,
  onMutate,
}: UseCollectionCreationParams): CollectionCreationHelpers => {
  const { t } = useTranslation('quran-reader');
  const commonT = useTranslation('common').t;
  const toast = useToast();

  const handleNewCollectionClick = useCallback((): void => {
    logButtonClick('save_bookmark_modal_new_collection');
    onStateChange({
      isCreatingCollection: true,
      newCollectionName: '',
    });
  }, [onStateChange]);

  const handleResetCollectionCreation = useCallback((): void => {
    onStateChange({
      isCreatingCollection: false,
      newCollectionName: '',
    });
  }, [onStateChange]);

  const handleCreateCollection = useCallback(async (): Promise<void> => {
    if (!newCollectionName.trim() || !verse) return;

    onStateChange({ isSubmittingCollection: true });
    try {
      const newCollection = (await addCollection(newCollectionName.trim())) as Collection;
      await addCollectionBookmark({
        key: Number(verse.chapterId),
        mushafId,
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
        collectionId: newCollection?.id,
      });
      toast(t('saved-to', { collectionName: newCollectionName.trim() }), {
        status: ToastStatus.Success,
      });
      logEvent('collection_created_and_ayah_added', {
        verseKey,
        collectionName: newCollectionName.trim(),
      });
      onMutate();
      onStateChange({
        isCreatingCollection: false,
        newCollectionName: '',
      });
    } catch (error) {
      toast(commonT('error.general'), { status: ToastStatus.Error });
    } finally {
      onStateChange({ isSubmittingCollection: false });
    }
  }, [verse, mushafId, verseKey, newCollectionName, onStateChange, onMutate, t, commonT, toast]);

  return {
    handleNewCollectionClick,
    handleBackFromNewCollection: handleResetCollectionCreation,
    handleCancelNewCollection: handleResetCollectionCreation,
    handleCreateCollection,
  };
};

export default useCollectionCreation;
