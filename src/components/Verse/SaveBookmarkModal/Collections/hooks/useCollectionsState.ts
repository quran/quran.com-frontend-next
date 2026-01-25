import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Bookmark from '@/types/Bookmark';
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
  }>;
}

interface UseCollectionsStateParams {
  isVerse: boolean;
  resourceBookmark: Bookmark | undefined;
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
  resourceBookmark,
  collectionListData,
  bookmarkCollectionIdsData,
}: UseCollectionsStateParams): UseCollectionsStateReturn => {
  const commonT = useTranslation('common').t;

  const isInFavorites = useMemo(
    () => Boolean(resourceBookmark?.isInDefaultCollection),
    [resourceBookmark?.isInDefaultCollection],
  );

  const sortedCollections = useMemo((): CollectionItem[] => {
    const favoritesCollection: CollectionItem = {
      id: DEFAULT_COLLECTION_ID,
      name: commonT('favorites'),
      checked: isInFavorites,
      isDefault: true,
    };

    if (!isVerse || !collectionListData?.data) {
      return [favoritesCollection];
    }

    const collections = collectionListData.data.map((collection) => ({
      id: collection.id,
      name: collection.name,
      checked: !!bookmarkCollectionIdsData?.includes(collection.id),
      updatedAt: collection.updatedAt,
      isDefault: false,
    }));

    return [favoritesCollection, ...collections];
  }, [collectionListData, bookmarkCollectionIdsData, isInFavorites, commonT, isVerse]);

  return {
    isInFavorites,
    sortedCollections,
  };
};

export default useCollectionsState;
