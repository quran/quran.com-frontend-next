import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

const useCollectionDetailData = ({
  collectionId,
  searchQuery,
  invalidateAllBookmarkCaches,
  fetchAll = false,
}: UseCollectionDetailDataParams) => {
  const [sortBy, setSortBy] = useState(CollectionDetailSortOption.VerseKey);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [allBookmarks, setAllBookmarks] = useState<
    GetBookmarkCollectionsIdResponse['data']['bookmarks']
  >([]);
  const lastAppendedCursorRef = useRef<string | null>(null);
  const numericCollectionId = slugifiedCollectionIdToCollectionId(collectionId);

  const onSortByChange = useCallback(
    (newSortByVal: CollectionDetailSortOption) => {
      logValueChange('collection_detail_page_sort_by', sortBy, newSortByVal);
      setSortBy(newSortByVal);
      // Reset pagination when sort changes
      setCurrentCursor(undefined);
      setAllBookmarks([]);
      lastAppendedCursorRef.current = null;
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

  useEffect(() => {
    setCurrentCursor(undefined);
    setAllBookmarks([]);
    lastAppendedCursorRef.current = null;
  }, [fetchAll, numericCollectionId]);

  // Auto-fetch all pages when fetchAll is enabled
  useEffect(() => {
    if (!fetchAll || !data) return;

    const pageCursor = currentCursor ?? 'start';
    if (lastAppendedCursorRef.current === pageCursor) return;

    lastAppendedCursorRef.current = pageCursor;
    setAllBookmarks((prevBookmarks) => [...prevBookmarks, ...bookmarks]);

    // Continue fetching if there are more pages
    if (pagination?.hasNextPage && pagination?.endCursor) {
      setCurrentCursor(pagination.endCursor);
    }
  }, [fetchAll, data, pagination, bookmarks, currentCursor]);

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

  const goToPreviousPage = useCallback(() => {
    if (pagination?.hasPreviousPage && pagination?.startCursor) {
      setCurrentCursor(pagination.startCursor);
    }
  }, [pagination]);

  const resetPagination = useCallback(() => {
    setCurrentCursor(undefined);
    setAllBookmarks([]);
    lastAppendedCursorRef.current = null;
  }, []);

  const onUpdated = useCallback(() => {
    // Reset pagination first to avoid revalidating (and re-appending) only the last fetched page
    // when `fetchAll` is enabled.
    if (fetchAll) setCurrentCursor(undefined);
    invalidateAllBookmarkCaches();
    setAllBookmarks([]);
    lastAppendedCursorRef.current = null;

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
    goToPreviousPage,
    resetPagination,
    isFetchingAll,
  };
};

export default useCollectionDetailData;
