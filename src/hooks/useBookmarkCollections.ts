import { useCallback, useRef } from 'react';

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
import mutatingFetcherConfig from '@/utils/swr';
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
  addToCollection: (collectionId: string) => Promise<boolean>;
  removeFromCollection: (collectionId: string) => Promise<boolean>;
  mutateBookmarkCollections: (newIds?: string[]) => void;
}

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
  const isPendingRef = useRef(false);

  const { data: collectionIds, mutate: mutateBookmarkCollections } = useSWR<string[]>(
    isLoggedIn ? makeBookmarkCollectionsUrl(mushafId, key, type, verseNumber) : null,
    async () => getBookmarkCollections(mushafId, key, type, verseNumber),
    mutatingFetcherConfig,
  );

  const showErrorToast = useCallback(
    (err: unknown) => {
      toast(t(isBookmarkSyncError(err) ? 'error.bookmark-sync' : 'error.general'), {
        status: ToastStatus.Error,
      });
    },
    [toast, t],
  );

  const invalidateCaches = useCallback(() => {
    globalMutate(makeBookmarkUrl(mushafId, key, type, verseNumber));
    if (bookmarksRangeUrl) globalMutate(bookmarksRangeUrl);
    globalMutate(makeBookmarksUrl(mushafId));
    globalMutate(makeCollectionsUrl({ type }));
  }, [globalMutate, mushafId, key, type, verseNumber, bookmarksRangeUrl]);

  const addToCollection = useCallback(
    async (collectionId: string): Promise<boolean> => {
      if (isPendingRef.current) return false;
      isPendingRef.current = true;
      const currentIds = collectionIds || [];
      try {
        await mutateBookmarkCollections(
          async () => {
            await addCollectionBookmark({ collectionId, key, mushafId, type, verseNumber });
            return [...currentIds, collectionId];
          },
          {
            optimisticData: [...currentIds, collectionId],
            rollbackOnError: true,
            revalidate: false,
          },
        );
        invalidateCaches();
        return true;
      } catch (err: unknown) {
        showErrorToast(err);
        return false;
      } finally {
        isPendingRef.current = false;
      }
    },
    [
      collectionIds,
      key,
      mushafId,
      type,
      verseNumber,
      mutateBookmarkCollections,
      invalidateCaches,
      showErrorToast,
    ],
  );

  const removeFromCollection = useCallback(
    async (collectionId: string): Promise<boolean> => {
      if (isPendingRef.current) return false;
      isPendingRef.current = true;
      const filteredIds = (collectionIds || []).filter((id) => id !== collectionId);
      try {
        await mutateBookmarkCollections(
          async () => {
            await deleteCollectionBookmarkByKey({ collectionId, key, mushafId, type, verseNumber });
            return filteredIds;
          },
          { optimisticData: filteredIds, rollbackOnError: true, revalidate: false },
        );
        invalidateCaches();
        return true;
      } catch (err: unknown) {
        showErrorToast(err);
        return false;
      } finally {
        isPendingRef.current = false;
      }
    },
    [
      collectionIds,
      key,
      mushafId,
      type,
      verseNumber,
      mutateBookmarkCollections,
      invalidateCaches,
      showErrorToast,
    ],
  );

  return {
    collectionIds: collectionIds || [],
    addToCollection,
    removeFromCollection,
    mutateBookmarkCollections: (newIds?: string[]) =>
      newIds !== undefined
        ? mutateBookmarkCollections(newIds, { revalidate: false })
        : mutateBookmarkCollections(),
  };
};

export default useBookmarkCollections;
