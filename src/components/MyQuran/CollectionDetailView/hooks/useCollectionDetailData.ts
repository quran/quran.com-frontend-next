import { useCallback, useMemo, useState } from 'react';

import useSWR from 'swr';

import { getJuzNumberByVerse } from '../juzVerseMapping';

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
  selectedChapterIds: string[];
  selectedJuzNumbers: string[];
  invalidateAllBookmarkCaches: () => void;
}

const useCollectionDetailData = ({
  collectionId,
  searchQuery,
  selectedChapterIds,
  selectedJuzNumbers,
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
    const query = (searchQuery || '').trim().toLowerCase();

    const hasChapterFilters = selectedChapterIds.length > 0;
    const hasJuzFilters = selectedJuzNumbers.length > 0;
    const shouldFilter = hasChapterFilters || hasJuzFilters;

    const chapterIdSet = hasChapterFilters ? new Set(selectedChapterIds) : null;
    const juzSet = hasJuzFilters ? new Set(selectedJuzNumbers) : null;

    return bookmarks.filter((bookmark) => {
      const verseKey = `${bookmark.key}:${bookmark.verseNumber ?? 1}`;
      if (query && !verseKey.includes(query)) return false;
      if (!shouldFilter) return true;

      const matchesChapter = chapterIdSet ? chapterIdSet.has(String(bookmark.key)) : true;
      const juzNumber = getJuzNumberByVerse(Number(bookmark.key), bookmark.verseNumber ?? 1);
      const matchesJuz = juzSet ? juzSet.has(String(juzNumber ?? '')) : true;

      // When both filters are active, require both matches (AND) so adding a filter always narrows results.
      return matchesChapter && matchesJuz;
    });
  }, [bookmarks, searchQuery, selectedChapterIds, selectedJuzNumbers]);

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
