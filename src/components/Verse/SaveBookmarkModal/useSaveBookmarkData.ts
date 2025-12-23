import { useMemo } from 'react';

import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import BookmarkType from '@/types/BookmarkType';
import { CollectionListSortOption } from '@/types/CollectionSortOptions';
import { WordVerse } from '@/types/Word';
import { getMushafId } from '@/utils/api';
import {
  getBookmark,
  getBookmarkCollections,
  getCollectionsList,
  getUserPreferences,
} from '@/utils/auth/api';
import {
  makeBookmarkCollectionsUrl,
  makeBookmarksUrl,
  makeBookmarkUrl,
  makeCollectionsUrl,
  makeUserPreferencesUrl,
} from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

interface UseSaveBookmarkDataParams {
  isVerse: boolean;
  isPage: boolean;
  verse: WordVerse | undefined;
  pageNumber: number | undefined;
  mushafId: number;
  quranReaderStyles: QuranReaderStyles;
}

/**
 * Custom hook to fetch all bookmark-related data
 * Manages SWR cache invalidation and data fetching
 * @param {UseSaveBookmarkDataParams} params Data fetching parameters
 * @returns {object} Data and mutate functions for all bookmark resources
 */
export const useSaveBookmarkData = ({
  isVerse,
  isPage,
  verse,
  pageNumber,
  mushafId,
  quranReaderStyles,
}: UseSaveBookmarkDataParams) => {
  const { mutate: globalSWRMutate } = useSWRConfig();

  // Fetch user preferences
  const { data: userPreferences } = useSWR(
    isLoggedIn() ? makeUserPreferencesUrl() : null,
    getUserPreferences,
  );

  const currentReadingBookmark = useMemo(() => {
    if (!userPreferences?.readingBookmark?.bookmark) return null;
    return userPreferences.readingBookmark.bookmark;
  }, [userPreferences]);

  // Fetch bookmark URL based on type
  const bookmarkUrl = useMemo(() => {
    if (!isLoggedIn()) return null;
    if (isVerse && verse) {
      return makeBookmarkUrl(
        mushafId,
        Number(verse.chapterId),
        BookmarkType.Ayah,
        Number(verse.verseNumber),
      );
    }
    if (isPage && pageNumber) {
      return makeBookmarkUrl(mushafId, Number(pageNumber), BookmarkType.Page);
    }
    return null;
  }, [isVerse, isPage, verse, pageNumber, mushafId]);

  // Fetch current bookmark
  const { data: resourceBookmark, mutate: mutateResourceBookmark } = useSWRImmutable(
    bookmarkUrl,
    () => {
      if (isVerse && verse) {
        return getBookmark(
          mushafId,
          Number(verse.chapterId),
          BookmarkType.Ayah,
          Number(verse.verseNumber),
        );
      }
      if (isPage && pageNumber) {
        return getBookmark(mushafId, Number(pageNumber), BookmarkType.Page);
      }
      return Promise.resolve(undefined);
    },
  );

  // Fetch collections list
  const { data: collectionListData, mutate: mutateCollectionListData } = useSWR(
    isLoggedIn() && isVerse ? makeCollectionsUrl({ type: BookmarkType.Ayah }) : null,
    () =>
      getCollectionsList({
        sortBy: CollectionListSortOption.Alphabetical,
      }),
  );

  // Fetch collections for this verse
  const { data: bookmarkCollectionIdsData, mutate: mutateBookmarkCollectionIdsData } =
    useSWRImmutable(
      isLoggedIn() && isVerse && verse
        ? makeBookmarkCollectionsUrl(
            mushafId,
            Number(verse.chapterId),
            BookmarkType.Ayah,
            Number(verse.verseNumber),
          )
        : null,
      () => {
        if (verse) {
          return getBookmarkCollections(
            mushafId,
            Number(verse.chapterId),
            BookmarkType.Ayah,
            Number(verse.verseNumber),
          );
        }
        return Promise.resolve([]);
      },
    );

  const mutateAllData = () => {
    mutateResourceBookmark();
    mutateCollectionListData();
    mutateBookmarkCollectionIdsData();
    globalSWRMutate(
      makeBookmarksUrl(
        getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
      ),
    );
    globalSWRMutate(makeUserPreferencesUrl());
  };

  return {
    userPreferences,
    currentReadingBookmark,
    resourceBookmark,
    collectionListData,
    bookmarkCollectionIdsData,
    mutateResourceBookmark,
    mutateCollectionListData,
    mutateBookmarkCollectionIdsData,
    mutateAllData,
    globalSWRMutate,
  };
};

export default useSaveBookmarkData;
