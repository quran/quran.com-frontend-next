import React, { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import CollectionsList from '@/components/Verse/SaveBookmarkModal/Collections/CollectionsList';
import { CollectionItem } from '@/components/Verse/SaveBookmarkModal/Collections/CollectionsListItem';
import styles from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal.module.scss';
import SaveBookmarkModalFooter from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModalFooter';
import SaveBookmarkModalHeader from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModalHeader';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import {
  broadcastPinnedVerses,
  PinnedVersesBroadcastType,
} from '@/hooks/usePinnedVersesBroadcast';
import { pinVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { privateFetcher, syncPinnedItems } from '@/utils/auth/api';
import {
  makeCollectionsUrl,
  makeGetBookmarkByCollectionId,
  PINNED_ITEMS_CACHE_PATHS,
} from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { makeVerseKey, getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import BookmarkType from 'types/BookmarkType';
import { Collection } from 'types/Collection';

const isPinnedItemsCacheKey = (key: unknown): boolean =>
  typeof key === 'string' &&
  Object.values(PINNED_ITEMS_CACHE_PATHS).some((p) => key.includes(p));

interface LoadFromCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoadFromCollectionModal: React.FC<LoadFromCollectionModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('quran-reader');
  const dispatch = useDispatch();
  const toast = useToast();
  const { mutate: globalMutate } = useSWRConfig();
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: collectionsData, isValidating: isLoadingCollections } = useSWRImmutable<{
    data: Collection[];
  }>(isOpen ? makeCollectionsUrl({ type: BookmarkType.Ayah }) : null, privateFetcher);

  const rawCollections = collectionsData?.data || [];

  const collectionItems: CollectionItem[] = [...rawCollections]
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || 0).getTime();
      const bTime = new Date(b.updatedAt || 0).getTime();
      return bTime - aTime;
    })
    .map((c) => ({
      id: c.id,
      name: c.name,
      checked: selectedCollectionId === c.id,
      updatedAt: c.updatedAt,
    }));

  const handleCollectionToggle = useCallback(
    async (collection: CollectionItem) => {
      setSelectedCollectionId((prev) => (prev === collection.id ? null : collection.id));
    },
    [],
  );

  const handleLoad = useCallback(async () => {
    if (!selectedCollectionId) return;

    logButtonClick('load_from_collection_confirm');
    setIsLoading(true);

    try {
      const collectionData = await privateFetcher<GetBookmarkCollectionsIdResponse>(
        makeGetBookmarkByCollectionId(selectedCollectionId, {
          type: BookmarkType.Ayah,
          limit: 1000,
        }),
      );

      const bookmarks = collectionData?.data?.bookmarks || [];

      if (bookmarks.length === 0) {
        toast(t('collection:empty'), { status: ToastStatus.Warning });
        setIsLoading(false);
        return;
      }

      const verseKeys = bookmarks.map((bookmark) =>
        makeVerseKey(bookmark.key, bookmark.verseNumber),
      );

      // 1. Update Redux
      dispatch(pinVerses(verseKeys));

      // 2. Sync to backend as pinned items
      const syncPayload = verseKeys.map((vk) => ({
        targetType: 'ayah',
        targetId: vk,
        metadata: {
          sourceMushafId: mushafId,
          key: getChapterNumberFromKey(vk),
          verseNumber: getVerseNumberFromKey(vk),
        },
        createdAt: new Date().toISOString(),
      }));
      await syncPinnedItems(syncPayload);

      // 3. Invalidate pinned items cache so useGlobalPinnedVerses refetches
      globalMutate(isPinnedItemsCacheKey, undefined, { revalidate: true });

      // 4. Broadcast to other tabs
      broadcastPinnedVerses(PinnedVersesBroadcastType.SET, { verseKeys });

      toast(t('verses-loaded-successfully'), { status: ToastStatus.Success });
      onClose();
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, onClose, selectedCollectionId, t, toast, mushafId, globalMutate]);

  const handleClose = useCallback(() => {
    setSelectedCollectionId(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClickOutside={handleClose}
      onEscapeKeyDown={handleClose}
      isBottomSheetOnMobile
      size={ModalSize.MEDIUM}
      contentClassName={styles.modal}
    >
      <Modal.Body>
        <div className={styles.container}>
          <SaveBookmarkModalHeader title={t('load-from-collection')} onClose={handleClose} />
          <CollectionsList
            collections={collectionItems}
            isDataReady={!isLoadingCollections}
            isTogglingFavorites={false}
            onCollectionToggle={handleCollectionToggle}
            onNewCollectionClick={() => {}}
          />
          <SaveBookmarkModalFooter
            showNoteButton={false}
            onTakeNote={() => {}}
            onDone={selectedCollectionId && !isLoading ? handleLoad : handleClose}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoadFromCollectionModal;
