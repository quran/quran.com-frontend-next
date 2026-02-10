import { useCallback, useEffect, useMemo, useState } from 'react';

import useSWR, { mutate as globalMutate } from 'swr';

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

const useCollectionDetailData = ({
  collectionId,
  searchQuery,
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

  const startFetchUrl = useMemo(() => {
    return makeGetBookmarkByCollectionId(numericCollectionId, {
      sortBy,
      type: BookmarkType.Ayah,
      limit: COLLECTION_BOOKMARKS_PER_PAGE,
    });
  }, [numericCollectionId, sortBy]);

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
      const nextPages = prevPages.slice();
      nextPages[existingIndex] = { cursor: pageCursor, bookmarks: pageBookmarks };
      return nextPages;
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
    if (!searchQuery) return sourcedBookmarks;
    const query = searchQuery.toLowerCase();
    return sourcedBookmarks.filter((bookmark) =>
      `${bookmark.key}:${bookmark.verseNumber}`.includes(query),
    );
  }, [bookmarks, allBookmarks, searchQuery, fetchAll]);

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
      globalMutate(startFetchUrl);
      return;
    }

    mutate();
  }, [fetchAll, invalidateAllBookmarkCaches, mutate, startFetchUrl]);

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
