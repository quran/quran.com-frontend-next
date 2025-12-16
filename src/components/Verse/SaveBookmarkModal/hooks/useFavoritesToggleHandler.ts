import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { useFavoritesToggle } from '../Collections/hooks/useFavoritesToggle';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import Bookmark from '@/types/Bookmark';
import { WordVerse } from '@/types/Word';

interface UseFavoritesToggleHandlerParams {
  verse: WordVerse | undefined;
  pageNumber: number | undefined;
  mushafId: number;
  resourceBookmark: Bookmark | undefined;
  bookmarkCollectionIdsData: string[] | undefined;
  verseKey: string;
  isResourceBookmarked: boolean;
  isVerse: boolean;
  isPage: boolean;
  mutateResourceBookmark: () => void;
  mutateBookmarkCollectionIdsData: () => void;
  mutateAllData: () => void;
}

interface UseFavoritesToggleHandlerReturn {
  isTogglingFavorites: boolean;
  handleFavoritesToggle: () => Promise<void>;
}

/**
 * Custom hook for handling favorites toggle with loading state
 * @param {UseFavoritesToggleHandlerParams} params Handler parameters
 * @returns {UseFavoritesToggleHandlerReturn} Handler state and function
 */
export const useFavoritesToggleHandler = ({
  verse,
  pageNumber,
  mushafId,
  resourceBookmark,
  bookmarkCollectionIdsData,
  verseKey,
  isResourceBookmarked,
  isVerse,
  isPage,
  mutateResourceBookmark,
  mutateBookmarkCollectionIdsData,
  mutateAllData,
}: UseFavoritesToggleHandlerParams): UseFavoritesToggleHandlerReturn => {
  const commonT = useTranslation('common').t;
  const toast = useToast();
  const [isTogglingFavorites, setIsTogglingFavorites] = useState(false);

  const favoritesToggle = useFavoritesToggle({
    verse,
    pageNumber,
    mushafId,
    resourceBookmark,
    bookmarkCollectionIdsData,
    verseKey,
    isResourceBookmarked,
    mutateResourceBookmark,
    mutateBookmarkCollectionIdsData,
    onToast: (message, status) => toast(message, { status }),
  });

  const handleFavoritesToggle = useCallback(async (): Promise<void> => {
    setIsTogglingFavorites(true);
    try {
      if (isVerse && resourceBookmark) {
        await favoritesToggle.handleVerseBookmarkToggle();
      } else if (isPage) {
        await favoritesToggle.handlePageBookmarkToggle();
      } else if (isVerse && !resourceBookmark && verse) {
        await favoritesToggle.handleNewVerseBookmark();
      }
      mutateAllData();
    } catch (err) {
      const error = err as { status?: number; message?: string };
      let errorMessage = commonT('error.general');

      if (error.status === 400) {
        errorMessage = commonT('error.bookmark-sync');
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = commonT('error.auth');
      } else if (error.status === 404) {
        errorMessage = commonT('error.not-found');
      } else if (error.status && error.status >= 500) {
        errorMessage = commonT('error.server');
      }

      toast(errorMessage, { status: ToastStatus.Error });
    } finally {
      setIsTogglingFavorites(false);
    }
  }, [
    isVerse,
    isPage,
    resourceBookmark,
    verse,
    favoritesToggle,
    mutateAllData,
    commonT,
    toast,
  ]);

  return {
    isTogglingFavorites,
    handleFavoritesToggle,
  };
};
