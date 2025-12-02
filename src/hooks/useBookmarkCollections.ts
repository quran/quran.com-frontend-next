import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR, { useSWRConfig } from 'swr';

import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import {
  addCollectionBookmark,
  deleteCollectionBookmarkByKey,
  getBookmarkCollections,
} from '@/utils/auth/api';
import {
  makeBookmarkCollectionsUrl,
  makeBookmarksUrl,
  makeBookmarkUrl,
  makeCollectionsUrl,
} from '@/utils/auth/apiPaths';
import { isBookmarkSyncError } from '@/utils/auth/errors';
import BookmarkType from 'types/BookmarkType';

interface UseBookmarkCollectionsProps {
  mushafId: number;
  key: number;
  type: BookmarkType;
  verseNumber?: number;
  bookmarksRangeUrl?: string;
}

interface UseBookmarkCollectionsReturn {
  collectionIds: string[];
  isLoading: boolean;
  addToCollection: (collectionId: string) => Promise<boolean>;
  removeFromCollection: (collectionId: string) => Promise<boolean>;
  mutateBookmarkCollections: (newIds?: string[]) => void;
}

/**
 * Custom hook for managing which collections a bookmark belongs to
 * Handles adding/removing bookmarks from collections with proper cache invalidation
 *
 * @param {UseBookmarkCollectionsProps} props - Hook configuration
 * @returns {UseBookmarkCollectionsReturn} Bookmark collection state and management functions
 */
const useBookmarkCollections = ({
  mushafId,
  key,
  type,
  verseNumber,
  bookmarksRangeUrl,
}: UseBookmarkCollectionsProps): UseBookmarkCollectionsReturn => {
  const { isLoggedIn } = useIsLoggedIn();
  const { mutate: globalMutate } = useSWRConfig();
  const toast = useToast();
  const { t } = useTranslation('common');

  // Using useSWR (not useSWRImmutable) because bookmark collections can be modified from other pages.
  // revalidateOnFocus enables cross-tab sync, revalidateOnReconnect ensures fresh data after offline.
  const {
    data: collectionIds,
    isValidating: isLoading,
    mutate: mutateBookmarkCollections,
  } = useSWR<string[]>(
    isLoggedIn ? makeBookmarkCollectionsUrl(mushafId, key, type, verseNumber) : null,
    async () => {
      const response = await getBookmarkCollections(mushafId, key, type, verseNumber);
      return response;
    },
  );

  const showErrorToast = useCallback(
    (err: unknown) => {
      toast(t(isBookmarkSyncError(err) ? 'error.bookmark-sync' : 'error.general'), {
        status: ToastStatus.Error,
      });
    },
    [toast, t],
  );

  /**
   * Invalidate all relevant caches after collection operations
   */
  const invalidateCaches = useCallback(() => {
    // Invalidate single bookmark cache
    globalMutate(makeBookmarkUrl(mushafId, key, type, verseNumber));

    // Invalidate bulk bookmark cache if available
    if (bookmarksRangeUrl) {
      globalMutate(bookmarksRangeUrl);
    }

    // Invalidate bookmarks list
    globalMutate(makeBookmarksUrl(mushafId));

    // Invalidate collections list
    globalMutate(makeCollectionsUrl({ type }));
  }, [globalMutate, mushafId, key, type, verseNumber, bookmarksRangeUrl]);

  const addToCollection = useCallback(
    async (collectionId: string): Promise<boolean> => {
      try {
        await addCollectionBookmark({
          collectionId,
          key,
          mushafId,
          type,
          verseNumber,
        });
        mutateBookmarkCollections();
        invalidateCaches();
        return true;
      } catch (err: unknown) {
        showErrorToast(err);
        return false;
      }
    },
    [key, mushafId, type, verseNumber, mutateBookmarkCollections, invalidateCaches, showErrorToast],
  );

  const removeFromCollection = useCallback(
    async (collectionId: string): Promise<boolean> => {
      try {
        await deleteCollectionBookmarkByKey({
          collectionId,
          key,
          mushafId,
          type,
          verseNumber,
        });
        mutateBookmarkCollections();
        invalidateCaches();
        return true;
      } catch (err: unknown) {
        showErrorToast(err);
        return false;
      }
    },
    [key, mushafId, type, verseNumber, mutateBookmarkCollections, invalidateCaches, showErrorToast],
  );

  return {
    collectionIds: collectionIds || [],
    isLoading,
    addToCollection,
    removeFromCollection,
    mutateBookmarkCollections: (newIds?: string[]) => {
      if (newIds !== undefined) {
        mutateBookmarkCollections(newIds, { revalidate: false });
      } else {
        mutateBookmarkCollections();
      }
    },
  };
};

export default useBookmarkCollections;
