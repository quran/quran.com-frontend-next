/* eslint-disable no-lonely-if */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
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
  getBookmark,
} from '@/utils/auth/api';
import { DEFAULT_COLLECTION_ID } from '@/utils/auth/constants';
import { logEvent } from '@/utils/eventLogger';

interface UseCollectionToggleParams {
  verse: WordVerse | undefined;
  pageNumber: number | undefined;
  mushafId: number;
  resourceBookmark: Bookmark | undefined;
  bookmarkCollectionIdsData: string[] | undefined;
  verseKey: string;
  isResourceBookmarked: boolean;
  mutateResourceBookmark: (data: Bookmark | undefined) => void;
  mutateBookmarkCollectionIdsData: () => void;
  onMutate?: () => void;
}

interface CollectionToggleHelpers {
  handleToggleCollection: (
    collectionId: string,
    collectionName: string,
    isCurrentlyInCollection: boolean,
  ) => Promise<void>;
  handleToggleFavorites: (checked: boolean) => Promise<void>;
  handlePageBookmarkToggle: () => Promise<void>;
}

/**
 * Unified hook to manage collection toggle logic for both favorites and regular collections
 * Handles adding/removing verses/pages from any collection (including favorites)
 * @param {UseCollectionToggleParams} params Collection toggle parameters
 * @returns {CollectionToggleHelpers} Object with handlers for collection operations
 */
export const useCollectionToggle = ({
  verse,
  pageNumber,
  mushafId,
  resourceBookmark,
  bookmarkCollectionIdsData,
  verseKey,
  isResourceBookmarked,
  mutateResourceBookmark,
  mutateBookmarkCollectionIdsData,
  onMutate,
}: UseCollectionToggleParams): CollectionToggleHelpers => {
  const commonT = useTranslation('common').t;
  const { t } = useTranslation('quran-reader');
  const toast = useToast();

  /**
   * Generic handler to add a bookmark to a collection
   */
  const addToCollection = useCallback(
    async (collectionId: string, collectionName: string, isVerse: boolean) => {
      try {
        if (isVerse && verse) {
          await addCollectionBookmark({
            key: Number(verse.chapterId),
            mushafId,
            type: BookmarkType.Ayah,
            verseNumber: verse.verseNumber,
            collectionId,
          });
          logEvent('ayah_added_to_collection', { verseKey, collectionId });
        } else if (!isVerse && pageNumber) {
          await addCollectionBookmark({
            key: pageNumber,
            mushafId,
            type: BookmarkType.Page,
            collectionId,
          });
          logEvent('page_added_to_collection', { pageNumber, collectionId });
        }

        // Fetch updated bookmark to sync local state
        if (isVerse && verse) {
          const updatedBookmark = await getBookmark(
            mushafId,
            Number(verse.chapterId),
            BookmarkType.Ayah,
            verse.verseNumber,
          );
          mutateResourceBookmark(updatedBookmark);
        } else if (!isVerse && pageNumber) {
          const updatedBookmark = await getBookmark(mushafId, pageNumber, BookmarkType.Page);
          mutateResourceBookmark(updatedBookmark);
        }

        // Show success message
        if (collectionId === DEFAULT_COLLECTION_ID) {
          const message = isVerse ? commonT('verse-bookmarked') : t('page-bookmarked');
          toast(message, { status: ToastStatus.Success });
          logEvent(isVerse ? 'verse_added_to_favorites' : 'page_added_to_favorites', {
            ...(isVerse ? { verseKey } : { pageNumber }),
          });
        } else {
          toast(t('saved-to', { collectionName }), { status: ToastStatus.Success });
        }

        mutateBookmarkCollectionIdsData();
        onMutate?.();
      } catch (err: unknown) {
        const error = err as { status?: number };
        const message =
          error.status === 400 ? commonT('error.bookmark-sync') : commonT('error.general');
        toast(message, { status: ToastStatus.Error });
      }
    },
    [
      verse,
      pageNumber,
      mushafId,
      verseKey,
      mutateResourceBookmark,
      mutateBookmarkCollectionIdsData,
      onMutate,
      toast,
      commonT,
      t,
    ],
  );

  /**
   * Generic handler to remove a bookmark from a collection
   */
  const removeFromCollection = useCallback(
    async (
      collectionId: string,
      collectionName: string,
      isVerse: boolean,
      shouldDeleteBookmark: boolean = false,
    ) => {
      if (!resourceBookmark) return;

      try {
        if (shouldDeleteBookmark) {
          // Delete the entire bookmark if it's the last collection and not in favorites
          await deleteBookmarkById(resourceBookmark.id);
          mutateResourceBookmark(undefined);
          logEvent('ayah_bookmark_deleted_from_last_collection', { verseKey, collectionId });
        } else {
          // Remove from collection
          if (isVerse && verse) {
            await deleteCollectionBookmarkByKey({
              key: Number(verse.chapterId),
              mushafId,
              type: BookmarkType.Ayah,
              verseNumber: verse.verseNumber,
              collectionId,
            });
          } else if (!isVerse && pageNumber) {
            await deleteCollectionBookmarkByKey({
              key: pageNumber,
              mushafId,
              type: BookmarkType.Page,
              collectionId,
            });
          }

          // Update local state
          if (collectionId === DEFAULT_COLLECTION_ID) {
            // For favorites, update the flag
            mutateResourceBookmark({
              ...resourceBookmark,
              isInDefaultCollection: false,
            });
          } else {
            // For regular collections, fetch updated bookmark
            if (isVerse && verse) {
              const updatedBookmark = await getBookmark(
                mushafId,
                Number(verse.chapterId),
                BookmarkType.Ayah,
                verse.verseNumber,
              );
              mutateResourceBookmark(updatedBookmark);
            } else if (!isVerse && pageNumber) {
              const updatedBookmark = await getBookmark(mushafId, pageNumber, BookmarkType.Page);
              mutateResourceBookmark(updatedBookmark);
            }
          }
        }

        // Show success message
        if (collectionId === DEFAULT_COLLECTION_ID) {
          const message = isVerse ? commonT('verse-bookmark-removed') : t('page-bookmark-removed');
          toast(message, { status: ToastStatus.Success });
          logEvent(isVerse ? 'verse_removed_from_favorites' : 'page_removed_from_favorites', {
            ...(isVerse ? { verseKey } : { pageNumber }),
          });
        } else {
          toast(t('removed-from', { collectionName }), { status: ToastStatus.Success });
          logEvent('ayah_removed_from_collection', { verseKey, collectionId });
        }

        mutateBookmarkCollectionIdsData();
        onMutate?.();
      } catch (err: unknown) {
        const error = err as { status?: number };
        const message =
          error.status === 400 ? commonT('error.bookmark-sync') : commonT('error.general');
        toast(message, { status: ToastStatus.Error });
      }
    },
    [
      resourceBookmark,
      verse,
      pageNumber,
      mushafId,
      verseKey,
      mutateResourceBookmark,
      mutateBookmarkCollectionIdsData,
      onMutate,
      toast,
      commonT,
      t,
    ],
  );

  /**
   * Toggle a bookmark in/out of a collection (works for both favorites and regular collections)
   */
  const handleToggleCollection = useCallback(
    async (
      collectionId: string,
      collectionName: string,
      isCurrentlyInCollection: boolean,
    ): Promise<void> => {
      const isVerse = !!verse;
      const isFavorite = collectionId === DEFAULT_COLLECTION_ID;

      if (isCurrentlyInCollection) {
        // Check if we should delete the bookmark entirely
        const collectionCount = bookmarkCollectionIdsData?.length ?? 0;
        const isLastCollection = collectionCount === 1;
        const isInFavorite = resourceBookmark?.isInDefaultCollection;
        const shouldDelete = isLastCollection && !isInFavorite && !isFavorite;

        await removeFromCollection(collectionId, collectionName, isVerse, shouldDelete);
      } else {
        await addToCollection(collectionId, collectionName, isVerse);
      }
    },
    [verse, bookmarkCollectionIdsData, resourceBookmark, addToCollection, removeFromCollection],
  );

  /**
   * Special handler for favorites toggle with additional logic
   * @param {boolean} checked - The new state (true = will be in favorites, false = will not be in favorites)
   */
  const handleToggleFavorites = useCallback(
    async (checked: boolean): Promise<void> => {
      const isVerse = !!verse;

      // If checked is true, we want to add to favorites
      // If checked is false, we want to remove from favorites
      const isCurrentlyInFavorites = !checked; // Current state is opposite of new state

      if (!resourceBookmark) {
        if (checked) {
          // Create new bookmark in favorites
          if (verse) {
            await addToCollection(DEFAULT_COLLECTION_ID, '', true);
          } else if (pageNumber) {
            await addToCollection(DEFAULT_COLLECTION_ID, '', false);
          }
        }
        // If checked is false and no bookmark exists, nothing to do
        return;
      }

      if (checked) {
        // Adding to favorites
        await handleToggleCollection(
          DEFAULT_COLLECTION_ID,
          '',
          isCurrentlyInFavorites, // false = not currently in favorites, so add it
        );
      } else {
        // Removing from favorites
        const isOnlyInFavorites =
          resourceBookmark.isInDefaultCollection &&
          (!bookmarkCollectionIdsData || bookmarkCollectionIdsData.length === 0);

        if (isOnlyInFavorites) {
          // Delete bookmark if it's only in favorites
          await deleteBookmarkById(resourceBookmark.id);
          mutateResourceBookmark(undefined);
          toast(isVerse ? commonT('verse-bookmark-removed') : t('page-bookmark-removed'), {
            status: ToastStatus.Success,
          });
          logEvent(isVerse ? 'verse_removed_from_favorites' : 'page_removed_from_favorites', {
            ...(isVerse ? { verseKey } : { pageNumber }),
          });
          mutateBookmarkCollectionIdsData();
          onMutate?.();
        } else {
          // Remove from favorites but keep bookmark (it's in other collections)
          await handleToggleCollection(
            DEFAULT_COLLECTION_ID,
            '',
            isCurrentlyInFavorites, // true = currently in favorites, so remove it
          );
        }
      }
    },
    [
      resourceBookmark,
      verse,
      pageNumber,
      bookmarkCollectionIdsData,
      verseKey,
      mutateResourceBookmark,
      mutateBookmarkCollectionIdsData,
      onMutate,
      toast,
      commonT,
      t,
      handleToggleCollection,
      addToCollection,
    ],
  );

  /**
   * Handler for page bookmark toggle (simplified version for pages)
   */
  const handlePageBookmarkToggle = useCallback(async (): Promise<void> => {
    if (isResourceBookmarked && resourceBookmark && pageNumber) {
      // Remove from favorites
      await removeFromCollection(DEFAULT_COLLECTION_ID, '', false);
    } else if (!isResourceBookmarked && pageNumber) {
      // Add to favorites
      await addToCollection(DEFAULT_COLLECTION_ID, '', false);
    }
  }, [isResourceBookmarked, resourceBookmark, pageNumber, addToCollection, removeFromCollection]);

  return {
    handleToggleCollection,
    handleToggleFavorites,
    handlePageBookmarkToggle,
  };
};

export default useCollectionToggle;
