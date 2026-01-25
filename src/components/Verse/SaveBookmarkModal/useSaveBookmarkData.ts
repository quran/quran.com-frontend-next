/* eslint-disable max-lines */
import { useCallback } from 'react';

import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import useGlobalReadingBookmark from '@/hooks/auth/useGlobalReadingBookmark';
import useSurahBookmarks, { SURAH_BOOKMARKS_KEY } from '@/hooks/auth/useSurahBookmarks';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { CollectionListSortOption } from '@/types/CollectionSortOptions';
import Verse from '@/types/Verse';
import { getBookmarkCollections, getCollectionsList } from '@/utils/auth/api';
import { makeBookmarkCollectionsUrl, makeCollectionsUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

interface UseSaveBookmarkDataParams {
  isVerse: boolean;
  isPage: boolean;
  verse: Verse | undefined;
  pageNumber: number | undefined;
  mushafId: number;
  quranReaderStyles: QuranReaderStyles;
}

/**
 * Custom hook to fetch all bookmark-related data
 * Manages SWR cache invalidation and data fetching
 *
 * Normal bookmarks (collections) are only supported for verses.
 * Reading bookmarks work for both pages and verses via useGlobalReadingBookmark.
 *
 * @param {UseSaveBookmarkDataParams} params Data fetching parameters
 * @returns {object} Data and mutate functions for all bookmark resources
 */
export const useSaveBookmarkData = ({ isVerse, verse, mushafId }: UseSaveBookmarkDataParams) => {
  const { mutate: globalSWRMutate } = useSWRConfig();

  // Use global reading bookmark hook (singleton pattern) - works for both pages and verses
  const { readingBookmark: readingBookmarkData, mutate: mutateReadingBookmark } =
    useGlobalReadingBookmark(mushafId);

  // Use surah-level bookmark hook for verses (fetches all bookmarks for the surah once)
  const {
    getVerseBookmark,
    updateVerseBookmark,
    mutate: mutateSurahBookmarks,
  } = useSurahBookmarks(verse ? Number(verse.chapterId) : 0, mushafId);

  // Get verse key for this bookmark
  const verseKey = verse ? `${verse.chapterId}:${verse.verseNumber}` : '';

  // Get resource bookmark from surah cache (only for verses)
  const resourceBookmark =
    isVerse && verse && isLoggedIn() ? getVerseBookmark(verseKey) : undefined;

  // Wrapper to handle optimistic updates or force revalidation (verses only)
  const mutateResourceBookmark = useCallback(
    (data?: Bookmark | undefined) => {
      if (!isVerse || !verse) {
        return Promise.resolve(undefined);
      }
      // For verses, update the surah bookmark cache
      if (data !== undefined) {
        updateVerseBookmark(verseKey, data);
      } else {
        // Force revalidation of surah bookmarks
        mutateSurahBookmarks(undefined, { revalidate: true });
      }
      return Promise.resolve(data);
    },
    [isVerse, verse, verseKey, updateVerseBookmark, mutateSurahBookmarks],
  );

  // Fetch collections list (only for verses)
  const { data: collectionListData, mutate: mutateCollectionListData } = useSWR(
    isLoggedIn() && isVerse ? makeCollectionsUrl({ type: BookmarkType.Ayah }) : null,
    () =>
      getCollectionsList({
        sortBy: CollectionListSortOption.Alphabetical,
      }),
  );

  // Fetch collections for this verse (only for verses)
  const { data: bookmarkCollectionIdsData, mutate: swrMutateBookmarkCollectionIdsData } =
    useSWRImmutable(
      isLoggedIn() && isVerse && verse
        ? makeBookmarkCollectionsUrl(
            mushafId,
            Number(verse.chapterId),
            BookmarkType.Ayah,
            Number(verse.verseNumber),
          )
        : null,
      async () => {
        if (verse) {
          try {
            return await getBookmarkCollections(
              mushafId,
              Number(verse.chapterId),
              BookmarkType.Ayah,
              Number(verse.verseNumber),
            );
          } catch {
            // Return empty array for errors
            return [];
          }
        }
        return [];
      },
    );

  // Wrapper to handle optimistic updates or force revalidation for useSWRImmutable
  const mutateBookmarkCollectionIdsData = useCallback(
    (optimisticData?: string[]) => {
      if (optimisticData !== undefined) {
        // Optimistically update with provided data without revalidating (no GET request)
        return swrMutateBookmarkCollectionIdsData(optimisticData, { revalidate: false });
      }
      // Force revalidation
      return swrMutateBookmarkCollectionIdsData(undefined, { revalidate: true });
    },
    [swrMutateBookmarkCollectionIdsData],
  );

  const mutateAllData = useCallback(async () => {
    await mutateReadingBookmark(undefined, { revalidate: true });

    if (isVerse && verse) {
      await mutateCollectionListData();
      await swrMutateBookmarkCollectionIdsData(undefined, { revalidate: true });
      await mutateSurahBookmarks(undefined, { revalidate: true });
    }
  }, [
    isVerse,
    verse,
    mutateSurahBookmarks,
    mutateCollectionListData,
    swrMutateBookmarkCollectionIdsData,
    mutateReadingBookmark,
  ]);

  // Function to invalidate surah cache (for external use)
  const invalidateSurahCache = useCallback(() => {
    if (verse) {
      globalSWRMutate(SURAH_BOOKMARKS_KEY(mushafId, Number(verse.chapterId)), undefined, {
        revalidate: true,
      });
    }
  }, [globalSWRMutate, mushafId, verse]);

  return {
    readingBookmarkData,
    resourceBookmark,
    collectionListData,
    bookmarkCollectionIdsData,
    mutateResourceBookmark,
    mutateCollectionListData,
    mutateBookmarkCollectionIdsData,
    mutateReadingBookmark,
    mutateSurahBookmarks,
    invalidateSurahCache,
    updateVerseBookmark,
    mutateAllData,
    globalSWRMutate,
  };
};

export default useSaveBookmarkData;
