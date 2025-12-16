import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { WordVerse } from '@/types/Word';
import {
  addCollectionBookmark,
  deleteCollectionBookmarkByKey,
  deleteBookmarkById,
} from '@/utils/auth/api';
import { logEvent } from '@/utils/eventLogger';

interface UseCollectionToggleParams {
  verse: WordVerse | undefined;
  mushafId: number;
  verseKey: string;
  resourceBookmark: Bookmark | undefined;
  bookmarkCollectionIdsData: string[] | undefined;
  onMutate: () => void;
}

/**
 * Custom hook to manage collection add/remove logic
 * Handles adding and removing verses from collections
 * @param {UseCollectionToggleParams} params Collection toggle parameters
 * @returns {Function} Handler for collection toggle operations
 */
export const useCollectionToggleHandler = ({
  verse,
  mushafId,
  verseKey,
  resourceBookmark,
  bookmarkCollectionIdsData,
  onMutate,
}: UseCollectionToggleParams) => {
  const { t } = useTranslation('quran-reader');
  const commonT = useTranslation('common').t;
  const toast = useToast();

  const handleAddToCollection = useCallback(
    async (collectionId: string, collectionName: string): Promise<void> => {
      if (!verse) return;
      logEvent('ayah_added_to_collection', { verseKey, collectionId });
      try {
        await addCollectionBookmark({
          key: Number(verse.chapterId),
          mushaf: mushafId,
          type: BookmarkType.Ayah,
          verseNumber: verse.verseNumber,
          collectionId,
        });
        toast(t('saved-to', { collectionName }), { status: ToastStatus.Success });
        onMutate();
      } catch (err: unknown) {
        const error = err as { status?: number; message?: string };
        let message = commonT('error.general');

        if (error.status === 400) {
          message = commonT('error.bookmark-sync');
        } else if (error.status === 401 || error.status === 403) {
          message = commonT('error.auth');
        } else if (error.status === 404) {
          message = commonT('error.not-found');
        } else if (error.status && error.status >= 500) {
          message = commonT('error.server');
        }

        toast(message, { status: ToastStatus.Error });
      }
    },
    [verse, mushafId, verseKey, toast, t, commonT, onMutate],
  );

  const handleRemoveFromCollection = useCallback(
    async (collectionId: string, collectionName: string): Promise<void> => {
      if (!resourceBookmark || !verse) return;

      logEvent('ayah_removed_from_collection', { verseKey, collectionId });
      try {
        const collectionCount = bookmarkCollectionIdsData?.length ?? 0;
        const isLastCollection = collectionCount === 1;
        const isInFavorite = resourceBookmark.isInDefaultCollection;

        if (isLastCollection && !isInFavorite) {
          await deleteBookmarkById(resourceBookmark.id);
          logEvent('ayah_bookmark_deleted_from_last_collection', { verseKey, collectionId });
        } else {
          await deleteCollectionBookmarkByKey({
            key: Number(verse.chapterId),
            mushaf: mushafId,
            type: BookmarkType.Ayah,
            verseNumber: verse.verseNumber,
            collectionId,
          });
        }
        toast(t('removed-from', { collectionName }), { status: ToastStatus.Success });
        onMutate();
      } catch (err: unknown) {
        const error = err as { status?: number; message?: string };
        let message = commonT('error.general');

        if (error.status === 400) {
          message = commonT('error.bookmark-sync');
        } else if (error.status === 401 || error.status === 403) {
          message = commonT('error.auth');
        } else if (error.status === 404) {
          message = commonT('error.not-found');
        } else if (error.status && error.status >= 500) {
          message = commonT('error.server');
        }

        toast(message, { status: ToastStatus.Error });
      }
    },
    [
      resourceBookmark,
      verse,
      mushafId,
      verseKey,
      bookmarkCollectionIdsData,
      toast,
      t,
      commonT,
      onMutate,
    ],
  );

  return { handleAddToCollection, handleRemoveFromCollection };
};

export default useCollectionToggleHandler;
