import React, { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR, { useSWRConfig } from 'swr';

import loadCollectionVerses from './loadCollectionVerses';

import CollectionsList from '@/components/Verse/SaveBookmarkModal/Collections/CollectionsList';
import { CollectionItem } from '@/components/Verse/SaveBookmarkModal/Collections/CollectionsListItem';
import { useCollectionsState } from '@/components/Verse/SaveBookmarkModal/Collections/hooks/useCollectionsState';
import styles from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal.module.scss';
import SaveBookmarkModalHeader from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModalHeader';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { CollectionListSortOption } from '@/types/CollectionSortOptions';
import { getMushafId } from '@/utils/api';
import { getCollectionsList } from '@/utils/auth/api';
import { makeCollectionsUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import BookmarkType from 'types/BookmarkType';
import { Collection } from 'types/Collection';

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

  const [isLoading, setIsLoading] = useState(false);

  const { data: collectionsData, isValidating: isLoadingCollections } = useSWR<{
    data: Collection[];
  }>(isOpen ? makeCollectionsUrl({ type: BookmarkType.Ayah }) : null, () =>
    getCollectionsList({ sortBy: CollectionListSortOption.Alphabetical }),
  );

  const { sortedCollections } = useCollectionsState({
    isVerse: true,
    collectionListData: collectionsData,
    bookmarkCollectionIdsData: undefined,
  });

  const handleCollectionToggle = useCallback(
    async (collection: CollectionItem) => {
      if (isLoading) return;

      logButtonClick('load_from_collection_confirm');
      setIsLoading(true);

      try {
        const verseKeys = await loadCollectionVerses(
          collection.id,
          mushafId,
          dispatch,
          globalMutate,
        );
        if (verseKeys.length === 0) {
          toast(t('collection-empty'), { status: ToastStatus.Warning });
          return;
        }
        toast(t('verses-loaded-successfully'), { status: ToastStatus.Success });
        onClose();
      } catch (error) {
        logErrorToSentry(error, { transactionName: 'loadFromCollection' });
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
          actions: [{ text: t('common:retry'), onClick: () => handleCollectionToggle(collection) }],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, isLoading, onClose, t, toast, mushafId, globalMutate],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClickOutside={onClose}
      onEscapeKeyDown={onClose}
      isBottomSheetOnMobile
      size={ModalSize.MEDIUM}
      contentClassName={styles.modal}
    >
      <Modal.Body>
        <div className={styles.container}>
          <SaveBookmarkModalHeader title={t('load-from-collection')} onClose={onClose} />
          <CollectionsList
            collections={sortedCollections}
            isDataReady={!isLoadingCollections}
            isTogglingFavorites={false}
            onCollectionToggle={handleCollectionToggle}
            hideNewCollection
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoadFromCollectionModal;
