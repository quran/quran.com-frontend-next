import { useCallback, useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR, { useSWRConfig } from 'swr';

import {
  UseBookmarkCollectionsProps,
  UseBookmarkCollectionsReturn,
  toSafeArray,
} from './useBookmarkCollections.types';

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

  // Only fetch when logged in AND we have valid key (chapter/surah number > 0)
  const shouldFetch = isLoggedIn && key > 0;

  const { data: rawCollectionIds, mutate: mutateBookmarkCollections } = useSWR<string[]>(
    shouldFetch ? makeBookmarkCollectionsUrl(mushafId, key, type, verseNumber) : null,
    () => getBookmarkCollections(mushafId, key, type, verseNumber),
    {
      ...mutatingFetcherConfig,
      revalidateOnFocus: false, // Prevent excessive refetches on window focus
    },
  );

  // Ensure collectionIds is always an array (API might return { data: [...] } or other formats)
  const collectionIds = toSafeArray(rawCollectionIds);

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
      try {
        await mutateBookmarkCollections(
          async (current) => {
            await addCollectionBookmark({ collectionId, key, mushafId, type, verseNumber });
            return [...toSafeArray(current), collectionId];
          },
          {
            optimisticData: [...collectionIds, collectionId],
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
      try {
        await mutateBookmarkCollections(
          async (current) => {
            await deleteCollectionBookmarkByKey({ collectionId, key, mushafId, type, verseNumber });
            return toSafeArray(current).filter((id) => id !== collectionId);
          },
          {
            optimisticData: collectionIds.filter((id) => id !== collectionId),
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

  // isReady indicates data has been fetched (rawCollectionIds is defined)
  const isReady = rawCollectionIds !== undefined;

  return {
    collectionIds,
    isReady,
    addToCollection,
    removeFromCollection,
    mutateBookmarkCollections: (newIds?: string[]) =>
      newIds !== undefined
        ? mutateBookmarkCollections(newIds, { revalidate: false })
        : mutateBookmarkCollections(),
  };
};

export default useBookmarkCollections;
