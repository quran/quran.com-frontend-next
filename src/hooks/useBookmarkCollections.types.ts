import BookmarkType from 'types/BookmarkType';

export interface UseBookmarkCollectionsProps {
  mushafId: number;
  key: number;
  type: BookmarkType;
  verseNumber?: number;
  bookmarksRangeUrl?: string;
}

export interface UseBookmarkCollectionsReturn {
  collectionIds: string[];
  isReady: boolean;
  addToCollection: (collectionId: string) => Promise<boolean>;
  removeFromCollection: (collectionId: string) => Promise<boolean>;
  mutateBookmarkCollections: (newIds?: string[]) => void;
}

/**
 * Safely converts API response to string array.
 * API might return { data: [...] } or direct array format.
 *
 * @param {unknown} value - The value to convert.
 * @returns {string[]} An array of strings.
 */
export const toSafeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value;
  if (
    value !== null &&
    typeof value === 'object' &&
    'data' in value &&
    Array.isArray((value as { data: unknown }).data)
  ) {
    return (value as { data: string[] }).data;
  }
  return [];
};
