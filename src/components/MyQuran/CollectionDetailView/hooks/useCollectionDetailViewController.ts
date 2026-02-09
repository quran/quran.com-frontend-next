import { useCallback, useMemo } from 'react';

import useCollectionBulkActions from './useCollectionBulkActions';
import useCollectionDetailData from './useCollectionDetailData';
import useCollectionDetailViewDeps from './useCollectionDetailViewDeps';
import useCollectionEditDelete from './useCollectionEditDelete';
import useCollectionNotes from './useCollectionNotes';
import useCollectionPinnedVerses from './useCollectionPinnedVerses';
import useCollectionSelection from './useCollectionSelection';

import { ToastStatus } from '@/dls/Toast/Toast';
import { deleteCollectionBookmarkById } from '@/utils/auth/api';
import { toLocalizedNumber } from '@/utils/locale';

const SINGLE_ITEM_COUNT = 1;

interface UseCollectionDetailViewControllerParams {
  collectionId: string;
  collectionName: string;
  searchQuery?: string;
  isDefault?: boolean;
  onCollectionUpdateRequest?: (collectionId: string, newName: string) => Promise<boolean>;
  onCollectionDeleteRequest?: (collectionId: string) => Promise<boolean>;
}

const useCollectionDetailViewController = ({
  collectionId,
  collectionName,
  searchQuery,
  isDefault,
  onCollectionUpdateRequest,
  onCollectionDeleteRequest,
}: UseCollectionDetailViewControllerParams) => {
  const {
    t,
    lang,
    toast,
    chaptersData,
    invalidateAllBookmarkCaches,
    isLoggedIn,
    globalMutate,
    dispatch,
    mushafId,
    selectedTranslations,
  } = useCollectionDetailViewDeps();
  const dataState = useCollectionDetailData({
    collectionId,
    searchQuery,
    invalidateAllBookmarkCaches,
  });
  const selection = useCollectionSelection({
    filteredBookmarks: dataState.filteredBookmarks,
    numericCollectionId: dataState.numericCollectionId,
  });
  const notes = useCollectionNotes({
    filteredBookmarks: dataState.filteredBookmarks,
    selectedBookmarks: selection.selectedBookmarks,
    numericCollectionId: dataState.numericCollectionId,
  });
  const editDelete = useCollectionEditDelete({
    numericCollectionId: dataState.numericCollectionId,
    t,
    toast,
    invalidateAllBookmarkCaches,
    onCollectionUpdateRequest,
    onCollectionDeleteRequest,
  });
  const pinnedVerses = useCollectionPinnedVerses({
    dispatch,
    globalMutate,
    isLoggedIn,
    mushafId,
    toast,
    t,
    numericCollectionId: dataState.numericCollectionId,
    filteredBookmarks: dataState.filteredBookmarks,
    selectedBookmarks: selection.selectedBookmarks,
  });
  const bulkActions = useCollectionBulkActions({
    chaptersData,
    lang,
    t,
    toast,
    numericCollectionId: dataState.numericCollectionId,
    filteredBookmarks: dataState.filteredBookmarks,
    selectedBookmarks: selection.selectedBookmarks,
    selectedTranslations,
    onUpdated: dataState.onUpdated,
    removeBookmarkIdsFromState: selection.removeBookmarkIdsFromState,
  });
  const { numericCollectionId, onUpdated } = dataState;

  const onItemDeleted = useCallback(
    (bookmarkId: string) => {
      deleteCollectionBookmarkById(numericCollectionId, bookmarkId)
        .then(() => {
          onUpdated();
          toast(
            t('collection:delete-bookmark.success', {
              count: toLocalizedNumber(SINGLE_ITEM_COUNT, lang),
            }),
            { status: ToastStatus.Success },
          );
        })
        .catch(() => {
          toast(t('common:error.general'), { status: ToastStatus.Error });
        });
    },
    [lang, numericCollectionId, onUpdated, t, toast],
  );

  const isOwner = dataState.data?.data?.isOwner ?? false;
  const totalCount = useMemo(() => dataState.data?.data?.bookmarks.length ?? 0, [dataState.data]);

  return {
    t,
    lang,
    toast,
    chaptersData,
    invalidateAllBookmarkCaches,
    isLoggedIn,
    globalMutate,
    dispatch,
    mushafId,
    selectedTranslations,
    ...dataState,
    ...selection,
    ...notes,
    ...editDelete,
    ...pinnedVerses,
    ...bulkActions,
    collectionName,
    isDefault,
    isOwner,
    totalCount,
    onItemDeleted,
  };
};

export default useCollectionDetailViewController;
