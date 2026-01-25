/* eslint-disable max-lines */
import { useCallback, useMemo, useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import {
  addCollection as apiAddCollection,
  deleteCollection as apiDeleteCollection,
  getCollectionsList,
  updateCollection as apiUpdateCollection,
} from '@/utils/auth/api';
import { makeCollectionsUrl } from '@/utils/auth/apiPaths';
import { isBookmarkSyncError } from '@/utils/auth/errors';
import mutatingFetcherConfig from '@/utils/swr';
import BookmarkType from 'types/BookmarkType';
import { Collection } from 'types/Collection';

interface UseCollectionsProps {
  type?: BookmarkType;
}

interface UseCollectionsReturn {
  collections: Collection[];
  isLoading: boolean;
  addCollection: (name: string) => Promise<Collection | null>;
  updateCollection: (collectionId: string, name: string) => Promise<boolean>;
  deleteCollection: (collectionId: string) => Promise<boolean>;
  /** Revalidate collections or set optimistic data */
  mutateCollections: (optimisticData?: Collection[]) => void;
}

/**
 * Custom hook for managing collections with optimistic updates.
 * Provides CRUD operations and reactive data fetching for collections.
 *
 * All operations use optimistic updates for instant UI feedback:
 * - Changes appear immediately before the API call completes
 * - On error, changes are automatically rolled back
 *
 * @param {UseCollectionsProps} props - Hook configuration
 * @returns {UseCollectionsReturn} Collections data and management functions
 */
const useCollections = ({
  type = BookmarkType.Ayah,
}: UseCollectionsProps = {}): UseCollectionsReturn => {
  const { isLoggedIn } = useIsLoggedIn();
  const toast = useToast();
  const { t } = useTranslation('common');
  const isPendingRef = useRef(false);

  const {
    data: collectionsData,
    isValidating,
    mutate: swrMutateCollections,
  } = useSWR<{ data: Collection[] }>(
    isLoggedIn ? makeCollectionsUrl({ type }) : null,
    () => getCollectionsList({ type }),
    { ...mutatingFetcherConfig, revalidateIfStale: true },
  );

  const collections = useMemo(() => collectionsData?.data || [], [collectionsData?.data]);
  const isLoading = useMemo(
    () => isValidating && !collectionsData,
    [isValidating, collectionsData],
  );

  const showErrorToast = useCallback(
    (err: unknown) => {
      toast(t(isBookmarkSyncError(err) ? 'error.bookmark-sync' : 'error.general'), {
        status: ToastStatus.Error,
      });
    },
    [toast, t],
  );

  const addCollection = useCallback(
    // eslint-disable-next-line react-func/max-lines-per-function
    async (name: string): Promise<Collection | null> => {
      if (isPendingRef.current) return null;
      isPendingRef.current = true;

      // Create optimistic collection with temporary ID
      const tempId = `temp-${Date.now()}`;
      const optimisticCollection: Collection = {
        id: tempId,
        name,
        url: name.toLowerCase().replace(/\s+/g, '-'),
        updatedAt: new Date().toISOString(),
      };

      try {
        const result = await swrMutateCollections(
          async (current) => {
            const newCollection = await apiAddCollection(name);
            // Replace optimistic collection with real one
            const existingCollections = current?.data?.filter((c) => c.id !== tempId) || [];
            return { ...current, data: [...existingCollections, newCollection] };
          },
          {
            optimisticData: {
              ...collectionsData,
              data: [...collections, optimisticCollection],
            },
            rollbackOnError: true,
            revalidate: false,
          },
        );

        // Find the real collection from the result
        const realCollection = result?.data?.find((c) => c.name === name && c.id !== tempId);
        return realCollection || null;
      } catch (err: unknown) {
        showErrorToast(err);
        return null;
      } finally {
        isPendingRef.current = false;
      }
    },
    [collections, collectionsData, swrMutateCollections, showErrorToast],
  );

  /**
   * Update collection with optimistic update.
   * Updates the name immediately, then confirms with API.
   */
  const updateCollection = useCallback(
    async (collectionId: string, name: string): Promise<boolean> => {
      if (isPendingRef.current) return false;
      isPendingRef.current = true;

      try {
        await swrMutateCollections(
          async (current) => {
            await apiUpdateCollection(collectionId, { name });
            return {
              ...current,
              data: current?.data?.map((c) => (c.id === collectionId ? { ...c, name } : c)),
            };
          },
          {
            optimisticData: {
              ...collectionsData,
              data: collections.map((c) => (c.id === collectionId ? { ...c, name } : c)),
            },
            rollbackOnError: true,
            revalidate: false,
          },
        );
        return true;
      } catch (err: unknown) {
        showErrorToast(err);
        return false;
      } finally {
        isPendingRef.current = false;
      }
    },
    [collections, collectionsData, swrMutateCollections, showErrorToast],
  );

  /**
   * Delete collection with optimistic update.
   * Removes from list immediately, then confirms with API.
   */
  const deleteCollection = useCallback(
    async (collectionId: string): Promise<boolean> => {
      if (isPendingRef.current) return false;
      isPendingRef.current = true;

      try {
        await swrMutateCollections(
          async (current) => {
            await apiDeleteCollection(collectionId);
            return {
              ...current,
              data: current?.data?.filter((c) => c.id !== collectionId),
            };
          },
          {
            optimisticData: {
              ...collectionsData,
              data: collections.filter((c) => c.id !== collectionId),
            },
            rollbackOnError: true,
            revalidate: false,
          },
        );
        return true;
      } catch (err: unknown) {
        showErrorToast(err);
        return false;
      } finally {
        isPendingRef.current = false;
      }
    },
    [collections, collectionsData, swrMutateCollections, showErrorToast],
  );

  /**
   * Wrapper to trigger revalidation or optimistic update
   */
  const mutateCollections = useCallback(
    (optimisticData?: Collection[]) => {
      if (optimisticData !== undefined) {
        swrMutateCollections({ ...collectionsData, data: optimisticData }, { revalidate: false });
      } else {
        swrMutateCollections();
      }
    },
    [collectionsData, swrMutateCollections],
  );

  return {
    collections,
    isLoading,
    addCollection,
    updateCollection,
    deleteCollection,
    mutateCollections,
  };
};

export default useCollections;
