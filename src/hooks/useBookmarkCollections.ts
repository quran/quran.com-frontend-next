/* eslint-disable max-lines */
import { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR, { useSWRConfig } from 'swr';

import {
  UseBookmarkCollectionsProps,
  UseBookmarkCollectionsReturn,
  toSafeArray,
} from './useBookmarkCollections.types';

import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useSurahBookmarks from '@/hooks/auth/useSurahBookmarks';
import Bookmark from '@/types/Bookmark';
import {
  addCollectionBookmark,
  deleteCollectionBookmarkByKey,
  getBookmarkCollections,
} from '@/utils/auth/api';
import {
  makeBookmarkCollectionsUrl,
  makeBookmarkUrl,
  makeBookmarksUrl,
  makeCollectionsUrl,
} from '@/utils/auth/apiPaths';
import { DEFAULT_COLLECTION_ID } from '@/utils/auth/constants';
import { isBookmarkSyncError } from '@/utils/auth/errors';
import mutatingFetcherConfig from '@/utils/swr';
import BookmarkType from 'types/BookmarkType';

const useBookmarkCollections = ({
  mushafId,
  key,
  type,
  verseNumber,
  bookmarksRangeUrl,
}: UseBookmarkCollectionsProps): UseBookmarkCollectionsReturn => {
  const { isLoggedIn } = useIsLoggedIn();
  const { mutate: globalMutate } = useSWRConfig();
  const toast = useToast();
  const { t } = useTranslation('common');
  const isPendingRef = useRef(false);
  const shouldUseSurahBookmarks = type === BookmarkType.Ayah && verseNumber !== undefined;
  const verseKey = shouldUseSurahBookmarks ? `${key}:${verseNumber}` : null;
  const { getVerseBookmark, updateVerseBookmark } = useSurahBookmarks(
    shouldUseSurahBookmarks ? key : 0,
    mushafId,
  );
  const { data: collectionIdsResponse, mutate: mutateBookmarkCollections } = useSWR<unknown>(
    isLoggedIn && key && verseNumber // only fetch if all params are present
      ? makeBookmarkCollectionsUrl(mushafId, key, type, verseNumber)
      : null,
    () => getBookmarkCollections(mushafId, key, type, verseNumber),
    {
      ...mutatingFetcherConfig,
      revalidateOnFocus: false, // Prevent excessive refetches on window focus
    },
  );
  const collectionIds = toSafeArray(collectionIdsResponse);
  const isReady = !!collectionIds.length;
  const showErrorToast = (err: unknown) => {
    toast(t(isBookmarkSyncError(err) ? 'error.bookmark-sync' : 'error.general'), {
      status: ToastStatus.Error,
    });
  };
  const invalidateCaches = () => {
    globalMutate(makeBookmarkUrl(mushafId, key, type, verseNumber));
    if (bookmarksRangeUrl) globalMutate(bookmarksRangeUrl);
    globalMutate(makeBookmarksUrl(mushafId));
    globalMutate(makeCollectionsUrl({ type }));
    // Invalidate surah bookmarks to ensure the bookmark is included in the map
    globalMutate(`surah-bookmarks-${mushafId}-${key}`);
  };
  const applyOptimisticBookmark = (
    optimisticIds: string[],
    previousBookmark: Bookmark | undefined,
  ) => {
    if (!shouldUseSurahBookmarks || verseNumber === undefined || !verseKey) return;
    if (optimisticIds.length === 0) {
      updateVerseBookmark(verseKey, undefined);
      return;
    }
    updateVerseBookmark(verseKey, {
      id: previousBookmark?.id ?? `optimistic-${verseKey}`,
      key,
      type: BookmarkType.Ayah,
      verseNumber,
      isInDefaultCollection: optimisticIds.includes(DEFAULT_COLLECTION_ID),
      collectionsCount: optimisticIds.length,
    });
  };
  const rollbackOptimisticBookmark = (previousBookmark: Bookmark | undefined) =>
    verseKey && updateVerseBookmark(verseKey, previousBookmark);
  const commitCollectionChange = async (nextIds: string[], mutation: () => Promise<any>) => {
    await mutateBookmarkCollections(
      async () => {
        const result = await mutation();
        // Update surah bookmarks with the real bookmark after API call
        if (shouldUseSurahBookmarks && verseKey && result.bookmark !== undefined) {
          updateVerseBookmark(verseKey, result.bookmark);
        }
        return nextIds;
      },
      { optimisticData: nextIds, rollbackOnError: true, revalidate: false },
    );
    invalidateCaches();
  };
  const addToCollection = async (collectionId: string): Promise<boolean> => {
    if (isPendingRef.current) return false;
    isPendingRef.current = true;
    const previousBookmark = verseKey ? getVerseBookmark(verseKey) : undefined;
    const nextIds = [...collectionIds, collectionId];
    applyOptimisticBookmark(nextIds, previousBookmark);
    try {
      await commitCollectionChange(nextIds, async () => {
        return addCollectionBookmark({
          collectionId,
          key,
          mushafId,
          type,
          verseNumber,
          bookmarkId: previousBookmark?.id,
        });
      });
      return true;
    } catch (err: unknown) {
      rollbackOptimisticBookmark(previousBookmark);
      showErrorToast(err);
      return false;
    } finally {
      isPendingRef.current = false;
    }
  };
  const removeFromCollection = async (collectionId: string): Promise<boolean> => {
    if (isPendingRef.current) return false;
    isPendingRef.current = true;
    const previousBookmark = verseKey ? getVerseBookmark(verseKey) : undefined;
    const nextIds = collectionIds.filter((id) => id !== collectionId);
    applyOptimisticBookmark(nextIds, previousBookmark);
    try {
      await commitCollectionChange(nextIds, async () => {
        return deleteCollectionBookmarkByKey({
          collectionId,
          key,
          mushafId,
          type,
          verseNumber,
        });
      });
      return true;
    } catch (err: unknown) {
      rollbackOptimisticBookmark(previousBookmark);
      showErrorToast(err);
      return false;
    } finally {
      isPendingRef.current = false;
    }
  };
  return {
    collectionIds,
    isReady,
    addToCollection,
    removeFromCollection,
    mutateBookmarkCollections: (newIds?: string[]) =>
      newIds !== undefined
        ? mutateBookmarkCollections(newIds, { revalidate: false })
        : mutateBookmarkCollections(),
  };
};

export default useBookmarkCollections;
