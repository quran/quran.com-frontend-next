import { useCallback, useMemo, useState } from 'react';

import useSWR from 'swr';

import BookmarkType from '@/types/BookmarkType';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { logValueChange } from '@/utils/eventLogger';
import { slugifiedCollectionIdToCollectionId } from '@/utils/string';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

const COLLECTION_BOOKMARKS_LIMIT = 10000;

interface UseCollectionDetailDataParams {
  collectionId: string;
  searchQuery?: string;
  invalidateAllBookmarkCaches: () => void;
}

const useCollectionDetailData = ({
  collectionId,
  searchQuery,
  invalidateAllBookmarkCaches,
}: UseCollectionDetailDataParams) => {
  const [sortBy, setSortBy] = useState(CollectionDetailSortOption.VerseKey);
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
      limit: COLLECTION_BOOKMARKS_LIMIT,
    });
  }, [numericCollectionId, sortBy]);

  const { data, mutate, error } = useSWR<GetBookmarkCollectionsIdResponse>(
    fetchUrl,
    privateFetcher,
  );

  const bookmarks = useMemo(() => data?.data.bookmarks ?? [], [data]);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter((bookmark) =>
      `${bookmark.key}:${bookmark.verseNumber}`.includes(query),
    );
  }, [bookmarks, searchQuery]);

  const onUpdated = useCallback(() => {
    mutate();
    invalidateAllBookmarkCaches();
  }, [invalidateAllBookmarkCaches, mutate]);

  return {
    numericCollectionId,
    sortBy,
    onSortByChange,
    data,
    mutate,
    error,
    bookmarks,
    filteredBookmarks,
    onUpdated,
  };
};

export default useCollectionDetailData;
