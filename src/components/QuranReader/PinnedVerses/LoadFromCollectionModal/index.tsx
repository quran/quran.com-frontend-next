import React, { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import loadCollectionVerses from './loadCollectionVerses';

import CollectionsList from '@/components/Verse/SaveBookmarkModal/Collections/CollectionsList';
import { CollectionItem } from '@/components/Verse/SaveBookmarkModal/Collections/CollectionsListItem';
import styles from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal.module.scss';
import SaveBookmarkModalHeader from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModalHeader';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { privateFetcher } from '@/utils/auth/api';
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
      if (isLoading) return;

      logButtonClick('load_from_collection_confirm');
      setSelectedCollectionId(collection.id);
      setIsLoading(true);

      try {
        const verseKeys = await loadCollectionVerses(
          collection.id,
          mushafId,
          dispatch,
          globalMutate,
        );
        if (verseKeys.length === 0) {
          toast(t('collection:empty'), { status: ToastStatus.Warning });
          setIsLoading(false);
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
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoadFromCollectionModal;
