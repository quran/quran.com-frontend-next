/* eslint-disable max-lines */
import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { ToastStatus } from '@/dls/Toast/Toast';
import Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { WordVerse } from '@/types/Word';
import { deleteBookmarkById, updateBookmarkById, addBookmark } from '@/utils/auth/api';
import { logEvent } from '@/utils/eventLogger';

interface FavoritesToggleHelpers {
  handleVerseBookmarkToggle: () => Promise<void>;
  handleNewVerseBookmark: () => Promise<void>;
  handlePageBookmarkToggle: () => Promise<void>;
}

interface UseFavoritesToggleParams {
  verse: WordVerse | undefined;
  pageNumber: number | undefined;
  mushafId: number;
  resourceBookmark: Bookmark | undefined;
  bookmarkCollectionIdsData: string[] | undefined;
  verseKey: string;
  isResourceBookmarked: boolean;
  mutateResourceBookmark: (data: Bookmark | undefined) => void;
  mutateBookmarkCollectionIdsData: () => void;
  onToast: (message: string, status: ToastStatus) => void;
}

/**
 * Custom hook to manage favorites toggle logic
 * Handles toggling verses/pages to/from favorites
 * @param {UseFavoritesToggleParams} params Favorites toggle parameters
 * @returns {FavoritesToggleHelpers} Object with handlers for favorites operations
 */
export const useFavoritesToggle = ({
  verse,
  pageNumber,
  mushafId,
  resourceBookmark,
  bookmarkCollectionIdsData,
  verseKey,
  isResourceBookmarked,
  mutateResourceBookmark,
  mutateBookmarkCollectionIdsData,
  onToast,
}: UseFavoritesToggleParams): FavoritesToggleHelpers => {
  const commonT = useTranslation('common').t;
  const { t } = useTranslation('quran-reader');

  const removeFavoriteOnly = useCallback(async () => {
    if (!resourceBookmark) return;
    await deleteBookmarkById(resourceBookmark.id);
    mutateResourceBookmark(undefined);
    onToast(commonT('verse-bookmark-removed'), ToastStatus.Success);
    logEvent('verse_removed_from_favorites', { verseKey });
  }, [resourceBookmark, mutateResourceBookmark, onToast, commonT, verseKey]);

  const handleNewVerseBookmark = useCallback(async (): Promise<void> => {
    if (!verse) return;
    const newBookmark = await addBookmark({
      key: Number(verse.chapterId),
      mushafId,
      type: BookmarkType.Ayah,
      verseNumber: verse.verseNumber,
    });
    mutateResourceBookmark(newBookmark);
    onToast(commonT('verse-bookmarked'), ToastStatus.Success);
    logEvent('verse_added_to_favorites', { verseKey });
    mutateBookmarkCollectionIdsData();
  }, [
    verse,
    mushafId,
    mutateResourceBookmark,
    onToast,
    commonT,
    verseKey,
    mutateBookmarkCollectionIdsData,
  ]);

  const updateFavoriteToggle = useCallback(
    async (newIsInDefaultCollection: boolean) => {
      if (!resourceBookmark) return;
      await updateBookmarkById(resourceBookmark.id, {
        isInDefaultCollection: newIsInDefaultCollection,
      });
      mutateResourceBookmark({
        ...resourceBookmark,
        isInDefaultCollection: newIsInDefaultCollection,
      });
      const message = newIsInDefaultCollection
        ? commonT('verse-bookmarked')
        : commonT('verse-bookmark-removed');
      onToast(message, ToastStatus.Success);
      logEvent(
        newIsInDefaultCollection ? 'verse_added_to_favorites' : 'verse_removed_from_favorites',
        { verseKey },
      );
    },
    [resourceBookmark, mutateResourceBookmark, onToast, commonT, verseKey],
  );

  const handleVerseBookmarkToggle = useCallback(async (): Promise<void> => {
    if (!resourceBookmark) return;
    const isOnlyInFavorites =
      resourceBookmark.isInDefaultCollection &&
      (!bookmarkCollectionIdsData || bookmarkCollectionIdsData.length === 0);

    if (isOnlyInFavorites) {
      await removeFavoriteOnly();
    } else {
      const isNotFavoritedAndHasNoCollections =
        !resourceBookmark.isInDefaultCollection &&
        (!bookmarkCollectionIdsData || bookmarkCollectionIdsData.length === 0);

      if (isNotFavoritedAndHasNoCollections) {
        await handleNewVerseBookmark();
      } else {
        const newIsInDefaultCollection = !resourceBookmark.isInDefaultCollection;
        await updateFavoriteToggle(newIsInDefaultCollection);
      }
    }
    mutateBookmarkCollectionIdsData();
  }, [
    resourceBookmark,
    bookmarkCollectionIdsData,
    mutateBookmarkCollectionIdsData,
    removeFavoriteOnly,
    handleNewVerseBookmark,
    updateFavoriteToggle,
  ]);

  const handlePageBookmarkToggle = useCallback(async (): Promise<void> => {
    if (isResourceBookmarked && resourceBookmark) {
      await deleteBookmarkById(resourceBookmark.id);
      mutateResourceBookmark(undefined);
      onToast(t('page-bookmark-removed'), ToastStatus.Success);
      logEvent('page_removed_from_favorites', { pageNumber });
    } else if (!isResourceBookmarked && pageNumber) {
      const newBookmark = await addBookmark({
        key: Number(pageNumber),
        mushafId,
        type: BookmarkType.Page,
      });
      mutateResourceBookmark(newBookmark);
      onToast(t('page-bookmarked'), ToastStatus.Success);
      logEvent('page_added_to_favorites', { pageNumber });
    }
  }, [
    isResourceBookmarked,
    resourceBookmark,
    pageNumber,
    mushafId,
    mutateResourceBookmark,
    onToast,
    t,
  ]);

  return {
    handleVerseBookmarkToggle,
    handleNewVerseBookmark,
    handlePageBookmarkToggle,
  };
};

export default useFavoritesToggle;
