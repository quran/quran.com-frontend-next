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
  sortingMode?: 'legacy' | 'saveBookmark';
}

interface UseCollectionsStateReturn {
  isInFavorites: boolean;
  sortedCollections: CollectionItem[];
}

interface CollectionItemWithUpdatedAtMs extends CollectionItem {
  updatedAtMs: number | null;
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
  sortingMode = 'legacy',
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

    if (sortingMode !== 'saveBookmark') {
      return collections;
    }

    const toUpdatedAtMs = (updatedAt?: string): number | null => {
      if (!updatedAt) return null;
      const parsed = Date.parse(updatedAt);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const compareByRecentUpdateThenName = (
      a: CollectionItemWithUpdatedAtMs,
      b: CollectionItemWithUpdatedAtMs,
    ): number => {
      // Sort by newest updatedAt first; unknown dates go last.
      if (a.updatedAtMs === null && b.updatedAtMs === null) {
        return a.name.localeCompare(b.name);
      }
      if (a.updatedAtMs === null) return 1;
      if (b.updatedAtMs === null) return -1;
      if (a.updatedAtMs !== b.updatedAtMs) return b.updatedAtMs - a.updatedAtMs;
      return a.name.localeCompare(b.name);
    };

    const collectionsWithUpdatedAtMs: CollectionItemWithUpdatedAtMs[] = collections.map(
      (collection) => ({
        ...collection,
        updatedAtMs: toUpdatedAtMs(collection.updatedAt),
      }),
    );

    const selectedCollections = collectionsWithUpdatedAtMs
      .filter((collection) => collection.checked)
      .sort(compareByRecentUpdateThenName);

    const unselectedCollections = collectionsWithUpdatedAtMs.filter(
      (collection) => !collection.checked,
    );
    const favoritesCollection = unselectedCollections.find((collection) => collection.isDefault);
    const remainingUnselectedCollections = unselectedCollections
      .filter((collection) => !collection.isDefault)
      .sort(compareByRecentUpdateThenName);

    return favoritesCollection
      ? [...selectedCollections, favoritesCollection, ...remainingUnselectedCollections]
      : [...selectedCollections, ...remainingUnselectedCollections];
  }, [collectionListData, bookmarkCollectionIdsData, isInFavorites, commonT, isVerse, sortingMode]);

  return {
    isInFavorites,
    sortedCollections,
  };
};

export default useCollectionsState;
