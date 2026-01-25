/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useSurahBookmarks from '@/hooks/auth/useSurahBookmarks';
import Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import Verse from '@/types/Verse';
import { addCollectionBookmark, deleteCollectionBookmarkByKey } from '@/utils/auth/api';
import { DEFAULT_COLLECTION_ID } from '@/utils/auth/constants';
import { logEvent } from '@/utils/eventLogger';

/**
 * Extract error status from unknown error type
 * @param {unknown} err - The error object
 * @returns {number | undefined} HTTP status code if available
 */
const getErrorStatus = (err: unknown): number | undefined => {
  if (err && typeof err === 'object' && 'status' in err) {
    return (err as { status?: number }).status;
  }
  return undefined;
};

interface UseCollectionToggleParams {
  verse: Verse | undefined;
  mushafId: number;
  bookmarkCollectionIdsData: string[] | undefined;
  verseKey: string;
  mutateResourceBookmark: (data: Bookmark | undefined) => void;
  mutateBookmarkCollectionIdsData: (optimisticData?: string[]) => void;
  onMutate?: () => void;
}

interface CollectionToggleHelpers {
  handleToggleCollection: (
    collectionId: string,
    collectionName: string,
    isCurrentlyInCollection: boolean,
  ) => Promise<void>;
  handleToggleFavorites: (checked: boolean) => Promise<void>;
}

/**
 * Hook to manage collection toggle logic for verses only.
 * Handles adding/removing verses from any collection (including favorites).
 * Note: Collection bookmarks are only supported for verses, not pages.
 * For reading bookmarks (pages and verses), use useGlobalReadingBookmark instead.
 *
 * @param {UseCollectionToggleParams} params Collection toggle parameters
 * @returns {CollectionToggleHelpers} Object with handlers for collection operations
 */
export const useCollectionToggle = ({
  verse,
  mushafId,
  bookmarkCollectionIdsData,
  verseKey,
  mutateResourceBookmark,
  mutateBookmarkCollectionIdsData,
  onMutate,
}: UseCollectionToggleParams): CollectionToggleHelpers => {
  const commonT = useTranslation('common').t;
  const { t } = useTranslation('quran-reader');
  const toast = useToast();
  const { getVerseBookmark, updateVerseBookmark } = useSurahBookmarks(
    verse ? Number(verse.chapterId) : 0,
    mushafId,
  );

  const buildOptimisticBookmark = useCallback(
    (collectionIds: string[], previousBookmark: Bookmark | undefined): Bookmark | undefined => {
      if (!verse) return previousBookmark;
      if (collectionIds.length === 0) return undefined;
      return {
        id: previousBookmark?.id ?? `optimistic-${verseKey}`,
        key: Number(verse.chapterId),
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
        isInDefaultCollection: collectionIds.includes(DEFAULT_COLLECTION_ID),
        collectionsCount: collectionIds.length,
      };
    },
    [verse, verseKey],
  );

  const getBaseCollectionIds = useCallback((): string[] => {
    const currentIds = [...(bookmarkCollectionIdsData || [])];
    const currentBookmark = getVerseBookmark(verseKey);
    if (currentBookmark?.isInDefaultCollection && !currentIds.includes(DEFAULT_COLLECTION_ID)) {
      currentIds.push(DEFAULT_COLLECTION_ID);
    }
    return currentIds;
  }, [bookmarkCollectionIdsData, getVerseBookmark, verseKey]);

  /**
   * Handler to add a verse bookmark to a collection
   */
  const addToCollection = useCallback(
    async (collectionId: string, collectionName: string) => {
      if (!verse) return;

      const key = Number(verse.chapterId);
      const previousBookmark = getVerseBookmark(verseKey);

      // Optimistically update collection IDs (add the new collection ID)
      const baseIds = getBaseCollectionIds();
      const optimisticCollectionIds = baseIds.includes(collectionId)
        ? baseIds
        : [...baseIds, collectionId];
      mutateBookmarkCollectionIdsData(optimisticCollectionIds);
      updateVerseBookmark(
        verseKey,
        buildOptimisticBookmark(optimisticCollectionIds, previousBookmark),
      );

      try {
        const response = await addCollectionBookmark({
          key,
          mushafId,
          type: BookmarkType.Ayah,
          collectionId,
          verseNumber: verse.verseNumber,
          bookmarkId: previousBookmark?.id,
        });

        logEvent('ayah_added_to_collection', {
          verseKey,
          collectionId,
        });

        // Show success message immediately after adding
        if (collectionId === DEFAULT_COLLECTION_ID) {
          toast(commonT('verse-bookmarked'), { status: ToastStatus.Success });
          logEvent('verse_added_to_favorites', { verseKey });
        } else {
          toast(t('saved-to', { collectionName }), { status: ToastStatus.Success });
        }

        onMutate?.();

        // Use bookmark from API response to update local state, enriched with current collections
        if (response.bookmark) {
          const enriched = {
            ...response.bookmark,
            collectionsCount: optimisticCollectionIds.length,
            isInDefaultCollection: optimisticCollectionIds.includes(DEFAULT_COLLECTION_ID),
          } as Bookmark;
          mutateResourceBookmark(enriched);
          updateVerseBookmark(verseKey, enriched);
        }
      } catch (err: unknown) {
        // Revert optimistic update on error
        mutateBookmarkCollectionIdsData(bookmarkCollectionIdsData);
        updateVerseBookmark(verseKey, previousBookmark);
        const message =
          getErrorStatus(err) === 400 ? commonT('error.bookmark-sync') : commonT('error.general');
        toast(message, { status: ToastStatus.Error });
      }
    },
    [
      verse,
      mushafId,
      verseKey,
      bookmarkCollectionIdsData,
      getVerseBookmark,
      updateVerseBookmark,
      buildOptimisticBookmark,
      mutateResourceBookmark,
      mutateBookmarkCollectionIdsData,
      getBaseCollectionIds,
      onMutate,
      toast,
      commonT,
      t,
    ],
  );

  /**
   * Handler to remove a verse bookmark from a collection
   * Backend handles orphan detection and cleanup automatically
   */
  const removeFromCollection = useCallback(
    async (collectionId: string, collectionName: string) => {
      if (!verse) return;

      const key = Number(verse.chapterId);
      const previousBookmark = getVerseBookmark(verseKey);

      // Optimistically update collection IDs (remove the collection ID)
      const optimisticCollectionIds = getBaseCollectionIds().filter((id) => id !== collectionId);
      mutateBookmarkCollectionIdsData(optimisticCollectionIds);
      updateVerseBookmark(
        verseKey,
        buildOptimisticBookmark(optimisticCollectionIds, previousBookmark),
      );

      try {
        // Backend handles orphan detection - returns null if bookmark was deleted
        const response = await deleteCollectionBookmarkByKey({
          key,
          mushafId,
          type: BookmarkType.Ayah,
          collectionId,
          verseNumber: verse.verseNumber,
        });

        // Update local state based on API response
        if (response.deleted) {
          // Bookmark was orphan and deleted by backend
          updateVerseBookmark(verseKey, undefined);
          logEvent('ayah_bookmark_deleted_from_last_collection', { verseKey, collectionId });
        } else if (response.bookmark) {
          // Bookmark still exists, update with new state, enriched with current collections
          const enriched = {
            ...response.bookmark,
            collectionsCount: optimisticCollectionIds.length,
            isInDefaultCollection: optimisticCollectionIds.includes(DEFAULT_COLLECTION_ID),
          } as Bookmark;
          mutateResourceBookmark(enriched);
          updateVerseBookmark(verseKey, enriched);
        }

        // Show success message
        if (collectionId === DEFAULT_COLLECTION_ID) {
          toast(commonT('verse-bookmark-removed'), { status: ToastStatus.Success });
          logEvent('verse_removed_from_favorites', { verseKey });
        } else {
          toast(t('removed-from', { collectionName }), { status: ToastStatus.Success });
          logEvent('ayah_removed_from_collection', { verseKey, collectionId });
        }

        onMutate?.();
      } catch (err: unknown) {
        // Revert optimistic update on error
        mutateBookmarkCollectionIdsData(bookmarkCollectionIdsData);
        updateVerseBookmark(verseKey, previousBookmark);
        const message =
          getErrorStatus(err) === 400 ? commonT('error.bookmark-sync') : commonT('error.general');
        toast(message, { status: ToastStatus.Error });
      }
    },
    [
      verse,
      mushafId,
      verseKey,
      bookmarkCollectionIdsData,
      getVerseBookmark,
      updateVerseBookmark,
      buildOptimisticBookmark,
      mutateResourceBookmark,
      mutateBookmarkCollectionIdsData,
      getBaseCollectionIds,
      onMutate,
      toast,
      commonT,
      t,
    ],
  );

  /**
   * Toggle a verse bookmark in/out of a collection
   * Backend handles orphan detection and cleanup automatically
   */
  const handleToggleCollection = useCallback(
    async (
      collectionId: string,
      collectionName: string,
      isCurrentlyInCollection: boolean,
    ): Promise<void> => {
      if (!verse) return;

      if (isCurrentlyInCollection) {
        await removeFromCollection(collectionId, collectionName);
      } else {
        await addToCollection(collectionId, collectionName);
      }
    },
    [verse, addToCollection, removeFromCollection],
  );

  /**
   * Special handler for favorites toggle
   * Backend handles orphan detection and cleanup automatically
   * @param {boolean} shouldBeInFavorites - The desired state (true = add to favorites, false = remove from favorites)
   */
  const handleToggleFavorites = useCallback(
    async (shouldBeInFavorites: boolean): Promise<void> => {
      if (!verse) return;
      const currentBookmark = getVerseBookmark(verseKey);

      // No bookmark exists - create one if adding to favorites
      if (!currentBookmark) {
        if (shouldBeInFavorites) {
          await addToCollection(DEFAULT_COLLECTION_ID, '');
        }
        return;
      }

      // Adding to favorites - call handleToggleCollection (isCurrentlyInCollection = false)
      if (shouldBeInFavorites) {
        await handleToggleCollection(DEFAULT_COLLECTION_ID, '', false);
        return;
      }

      // Removing from favorites - backend handles orphan cleanup
      await removeFromCollection(DEFAULT_COLLECTION_ID, '');
    },
    [
      verse,
      verseKey,
      getVerseBookmark,
      addToCollection,
      handleToggleCollection,
      removeFromCollection,
    ],
  );

  return {
    handleToggleCollection,
    handleToggleFavorites,
  };
};

export default useCollectionToggle;
