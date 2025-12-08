import { useCallback } from 'react';

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
  mutateCollections: () => void;
}

/**
 * Custom hook for managing collections
 * Provides CRUD operations and reactive data fetching for collections
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

  const {
    data: collectionsData,
    isValidating: isLoading,
    mutate: mutateCollections,
  } = useSWR<{ data: Collection[] }>(isLoggedIn ? makeCollectionsUrl({ type }) : null, () =>
    getCollectionsList({ type }),
  );

  const collections = collectionsData?.data || [];

  const showErrorToast = useCallback(
    (err: unknown) => {
      toast(t(isBookmarkSyncError(err) ? 'error.bookmark-sync' : 'error.general'), {
        status: ToastStatus.Error,
      });
    },
    [toast, t],
  );

  const addCollection = useCallback(
    async (name: string): Promise<Collection | null> => {
      try {
        const newCollection = await apiAddCollection(name);
        mutateCollections();
        return newCollection;
      } catch (err: unknown) {
        showErrorToast(err);
        return null;
      }
    },
    [mutateCollections, showErrorToast],
  );

  const updateCollection = useCallback(
    async (collectionId: string, name: string): Promise<boolean> => {
      try {
        await apiUpdateCollection(collectionId, { name });
        mutateCollections();
        return true;
      } catch (err: unknown) {
        showErrorToast(err);
        return false;
      }
    },
    [mutateCollections, showErrorToast],
  );

  const deleteCollection = useCallback(
    async (collectionId: string): Promise<boolean> => {
      try {
        await apiDeleteCollection(collectionId);
        mutateCollections();
        return true;
      } catch (err: unknown) {
        showErrorToast(err);
        return false;
      }
    },
    [mutateCollections, showErrorToast],
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
