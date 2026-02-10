import { useCallback, useEffect, useMemo, useState } from 'react';

import useSWR, { mutate as globalMutate } from 'swr';

import { getJuzNumberByVerse } from '../juzVerseMapping';

import BookmarkType from '@/types/BookmarkType';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { logValueChange } from '@/utils/eventLogger';
import { slugifiedCollectionIdToCollectionId } from '@/utils/string';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

const COLLECTION_BOOKMARKS_PER_PAGE = 20;

interface UseCollectionDetailDataParams {
  collectionId: string;
  searchQuery?: string;
  selectedChapterIds?: string[];
  selectedJuzNumbers?: string[];
  invalidateAllBookmarkCaches: () => void;
  fetchAll?: boolean;
}

type CollectionBookmarksPage = {
  /**
   * SWR cursor for the page. We use a synthetic "start" token for the first page to keep
   * page identity stable across revalidations.
   */
  cursor: string;
  bookmarks: GetBookmarkCollectionsIdResponse['data']['bookmarks'];
};
const EMPTY_STRING_ARRAY: string[] = [];

const useCollectionDetailData = ({
  collectionId,
  searchQuery,
  selectedChapterIds = EMPTY_STRING_ARRAY,
  selectedJuzNumbers = EMPTY_STRING_ARRAY,
  invalidateAllBookmarkCaches,
  fetchAll = false,
}: UseCollectionDetailDataParams) => {
  const [sortBy, setSortBy] = useState(CollectionDetailSortOption.VerseKey);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [allBookmarksPages, setAllBookmarksPages] = useState<CollectionBookmarksPage[]>([]);
  const numericCollectionId = slugifiedCollectionIdToCollectionId(collectionId);

  const onSortByChange = useCallback(
    (newSortByVal: CollectionDetailSortOption) => {
      logValueChange('collection_detail_page_sort_by', sortBy, newSortByVal);
      setSortBy(newSortByVal);
    },
    [sortBy],
  );

  const fetchUrl = useMemo(() => {
    return makeGetBookmarkByCollectionId(numericCollectionId, {
      sortBy,
      type: BookmarkType.Ayah,
      limit: COLLECTION_BOOKMARKS_PER_PAGE,
      ...(currentCursor && { cursor: currentCursor }),
    });
  }, [numericCollectionId, sortBy, currentCursor]);

  const { data, mutate, error } = useSWR<GetBookmarkCollectionsIdResponse>(
    fetchUrl,
    privateFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true },
  );

  const bookmarks = useMemo(() => data?.data.bookmarks ?? [], [data]);
  const pagination = useMemo(() => data?.pagination, [data]);
  const allBookmarks = useMemo(
    () => allBookmarksPages.flatMap((page) => page.bookmarks),
    [allBookmarksPages],
  );

  // Reset pagination when the collection, fetch mode, or sort order changes
  useEffect(() => {
    setCurrentCursor(undefined);
    setAllBookmarksPages([]);
  }, [fetchAll, numericCollectionId, sortBy]);

  // Auto-fetch all pages when fetchAll is enabled
  useEffect(() => {
    if (!fetchAll || !data) return;

    const pageBookmarks = data.data.bookmarks ?? [];
    const pagePagination = data.pagination;

    // When SWR returns cached data then revalidates, `data` may update for the same cursor.
    // Track pages by cursor so we can replace the page instead of appending duplicates or
    // ignoring revalidated results.
    const pageCursor = currentCursor ?? 'start';
    setAllBookmarksPages((prevPages) => {
      const existingIndex = prevPages.findIndex((page) => page.cursor === pageCursor);
      if (existingIndex === -1) {
        return [...prevPages, { cursor: pageCursor, bookmarks: pageBookmarks }];
      }
      return prevPages.map((page, idx) =>
        idx === existingIndex ? { cursor: pageCursor, bookmarks: pageBookmarks } : page,
      );
    });

    // Continue fetching if there are more pages
    if (pagePagination?.hasNextPage && pagePagination?.endCursor) {
      // Only update cursor if it's different to avoid triggering unnecessary fetches
      if (pagePagination.endCursor !== currentCursor) {
        setCurrentCursor(pagePagination.endCursor);
      }
    }
  }, [fetchAll, data, currentCursor]);

  const filteredBookmarks = useMemo(() => {
    const sourcedBookmarks = fetchAll ? allBookmarks : bookmarks;
    const query = searchQuery.toLowerCase();

    const hasChapterFilters = selectedChapterIds.length > 0;
    const hasJuzFilters = selectedJuzNumbers.length > 0;
    const shouldFilter = hasChapterFilters || hasJuzFilters;

    const chapterIdSet = hasChapterFilters ? new Set(selectedChapterIds) : null;
    const juzSet = hasJuzFilters ? new Set(selectedJuzNumbers) : null;

    return sourcedBookmarks.filter((bookmark) => {
      const verseKey = `${bookmark.key}:${bookmark.verseNumber ?? 1}`;
      if (query && !verseKey.includes(query)) return false;
      if (!shouldFilter) return true;

      // When filtering, a filter group that isn't active should not "auto-match" everything.
      // We OR the active filter groups together so results match *any* selected chapter/juz.
      const matchesChapter = chapterIdSet ? chapterIdSet.has(String(bookmark.key)) : false;
      // Juz lookup is skipped when no juz filter is active (juzSet is null).
      const matchesJuz = juzSet
        ? juzSet.has(
            String(getJuzNumberByVerse(Number(bookmark.key), bookmark.verseNumber ?? 1) ?? ''),
          )
        : false;
      return matchesChapter || matchesJuz;
    });
  }, [bookmarks, searchQuery, selectedChapterIds, selectedJuzNumbers, allBookmarks, fetchAll]);

  const goToNextPage = useCallback(() => {
    if (pagination?.hasNextPage && pagination?.endCursor) {
      setCurrentCursor(pagination.endCursor);
    }
  }, [pagination]);

  const resetPagination = useCallback(() => {
    setCurrentCursor(undefined);
    setAllBookmarksPages([]);
  }, []);

  const onUpdated = useCallback(() => {
    // Reset pagination first to avoid revalidating (and re-appending) only the last fetched page
    // when `fetchAll` is enabled.
    if (fetchAll) setCurrentCursor(undefined);
    invalidateAllBookmarkCaches();
    setAllBookmarksPages([]);

    if (fetchAll) {
      // Revalidate the first page URL for the current sort order
      globalMutate(
        makeGetBookmarkByCollectionId(numericCollectionId, {
          sortBy,
          type: BookmarkType.Ayah,
          limit: COLLECTION_BOOKMARKS_PER_PAGE,
        }),
      );
      return;
    }

    mutate();
  }, [fetchAll, invalidateAllBookmarkCaches, mutate, numericCollectionId, sortBy]);

  const isFetchingAll = fetchAll && (!data || pagination?.hasNextPage === true);

  return {
    numericCollectionId,
    sortBy,
    onSortByChange,
    data,
    mutate,
    error,
    bookmarks: fetchAll ? allBookmarks : bookmarks,
    filteredBookmarks,
    pagination,
    onUpdated,
    goToNextPage,
    resetPagination,
    isFetchingAll,
  };
};

export default useCollectionDetailData;
