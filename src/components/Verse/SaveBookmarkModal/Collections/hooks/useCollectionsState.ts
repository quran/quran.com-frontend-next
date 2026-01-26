/* eslint-disable react-func/max-lines-per-function */
import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { DEFAULT_COLLECTION_ID } from '@/utils/auth/constants';

interface CollectionItem {
  id: string;
  name: string;
  checked: boolean;
  updatedAt?: string;
  isDefault?: boolean;
}

interface CollectionListData {
  data?: Array<{
    id: string;
    name: string;
    updatedAt?: string;
    isDefault?: boolean;
  }>;
}

interface UseCollectionsStateParams {
  isVerse: boolean;
  collectionListData: CollectionListData | undefined;
  bookmarkCollectionIdsData: string[] | undefined;
}

interface UseCollectionsStateReturn {
  isInFavorites: boolean;
  sortedCollections: CollectionItem[];
}

/**
 * Custom hook to manage collections state and derived values
 * Computes isInFavorites and sortedCollections
 * @param {UseCollectionsStateParams} params Collections state parameters
 * @returns {object} Computed collections state
 */
export const useCollectionsState = ({
  isVerse,
  collectionListData,
  bookmarkCollectionIdsData,
}: UseCollectionsStateParams): UseCollectionsStateReturn => {
  const commonT = useTranslation('common').t;

  const isInFavorites = useMemo(
    () => Boolean(bookmarkCollectionIdsData?.includes(DEFAULT_COLLECTION_ID)),
    [bookmarkCollectionIdsData],
  );

  const sortedCollections = useMemo((): CollectionItem[] => {
    if (!isVerse) {
      return [];
    }

    const collections: CollectionItem[] = [];

    // Check if default collection is in the API response
    const apiDefaultCollection = collectionListData?.data?.find(
      (collection) => collection.id === DEFAULT_COLLECTION_ID,
    );

    // Add default collection (from API or manual)
    if (apiDefaultCollection) {
      collections.push({
        id: DEFAULT_COLLECTION_ID,
        name: commonT('favorites'),
        checked: isInFavorites,
        updatedAt: apiDefaultCollection.updatedAt,
        isDefault: true,
      });
    } else {
      collections.push({
        id: DEFAULT_COLLECTION_ID,
        name: commonT('favorites'),
        checked: isInFavorites,
        isDefault: true,
      });
    }

    // Add other collections from API response
    collectionListData?.data?.forEach((collection) => {
      if (collection.id !== DEFAULT_COLLECTION_ID) {
        collections.push({
          id: collection.id,
          name: collection.name,
          checked: !!bookmarkCollectionIdsData?.includes(collection.id),
          updatedAt: collection.updatedAt,
          isDefault: false,
        });
      }
    });

    return collections;
  }, [collectionListData, bookmarkCollectionIdsData, isInFavorites, commonT, isVerse]);

  return {
    isInFavorites,
    sortedCollections,
  };
};

export default useCollectionsState;
