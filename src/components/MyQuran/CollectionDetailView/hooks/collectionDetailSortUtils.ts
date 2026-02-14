/* eslint-disable react-func/max-lines-per-function */
import Bookmark from '@/types/Bookmark';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

const getBookmarkCreatedAtMs = (createdAt?: string) => {
  if (!createdAt) return null;
  const ms = Date.parse(createdAt);
  return Number.isFinite(ms) ? ms : null;
};

const getBookmarkVerseOrder = (bookmark: Bookmark) => {
  // 1000 is safely above the max ayah count per chapter (286).
  return Number(bookmark.key) * 1000 + Number(bookmark.verseNumber ?? 1);
};

export const normalizeCollectionDetailSort = (sortBy: CollectionDetailSortOption) => {
  // Backwards compatibility: older IDs are still in the enum and may exist in user state.
  if (sortBy === CollectionDetailSortOption.RecentlyAdded) {
    return CollectionDetailSortOption.DateDesc;
  }
  if (sortBy === CollectionDetailSortOption.VerseKey) {
    return CollectionDetailSortOption.QuranicOrderAsc;
  }
  return sortBy;
};

export const sortCollectionBookmarks = (
  bookmarks: Bookmark[],
  sortBy: CollectionDetailSortOption,
) => {
  const normalizedSort = normalizeCollectionDetailSort(sortBy);

  const compareByDate = (a: Bookmark, b: Bookmark, dir: 1 | -1) => {
    const aMs = getBookmarkCreatedAtMs(a.createdAt);
    const bMs = getBookmarkCreatedAtMs(b.createdAt);

    // Unknown/invalid dates go last in both directions.
    if (aMs === null && bMs === null) return 0;
    if (aMs === null) return 1;
    if (bMs === null) return -1;
    if (aMs !== bMs) return (aMs - bMs) * dir;

    // Stable tie-breaker: Quranic order asc.
    return getBookmarkVerseOrder(a) - getBookmarkVerseOrder(b);
  };

  const compareByQuranicOrder = (a: Bookmark, b: Bookmark, dir: 1 | -1) => {
    const aOrder = getBookmarkVerseOrder(a);
    const bOrder = getBookmarkVerseOrder(b);
    if (aOrder !== bOrder) return (aOrder - bOrder) * dir;

    // Tie-breaker: newest first (if available).
    const aMs = getBookmarkCreatedAtMs(a.createdAt);
    const bMs = getBookmarkCreatedAtMs(b.createdAt);
    if (aMs === null && bMs === null) return 0;
    if (aMs === null) return 1;
    if (bMs === null) return -1;
    return bMs - aMs;
  };

  return [...bookmarks].sort((a, b) => {
    switch (normalizedSort) {
      case CollectionDetailSortOption.DateAsc:
        return compareByDate(a, b, 1);
      case CollectionDetailSortOption.DateDesc:
        return compareByDate(a, b, -1);
      case CollectionDetailSortOption.QuranicOrderAsc:
        return compareByQuranicOrder(a, b, 1);
      case CollectionDetailSortOption.QuranicOrderDesc:
        return compareByQuranicOrder(a, b, -1);
      default:
        return compareByQuranicOrder(a, b, 1);
    }
  });
};
