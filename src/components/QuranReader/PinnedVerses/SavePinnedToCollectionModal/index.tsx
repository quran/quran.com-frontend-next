import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import useSavePinnedToCollection from './useSavePinnedToCollection';

import CollectionsList from '@/components/Verse/SaveBookmarkModal/Collections/CollectionsList';
import NewCollectionForm from '@/components/Verse/SaveBookmarkModal/Collections/NewCollectionForm';
import styles from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal.module.scss';
import SaveBookmarkModalHeader from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModalHeader';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';

interface SavePinnedToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SavePinnedToCollectionModal: React.FC<SavePinnedToCollectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation('common');

  const {
    collectionItems,
    isLoading,
    isSaving,
    isCreatingCollection,
    newCollectionName,
    isSubmittingCollection,
    setNewCollectionName,
    handleCollectionToggle,
    handleNewCollectionClick,
    resetNewCollection,
    handleCreateCollection,
  } = useSavePinnedToCollection(onClose);

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
        {isCreatingCollection ? (
          <NewCollectionForm
            onBack={resetNewCollection}
            onClose={onClose}
            onCancel={resetNewCollection}
            onCreate={handleCreateCollection}
            newCollectionName={newCollectionName}
            onNameChange={setNewCollectionName}
            isSubmittingCollection={isSubmittingCollection}
          />
        ) : (
          <div className={styles.container}>
            <SaveBookmarkModalHeader title={t('save-to-collection')} onClose={onClose} />
            <CollectionsList
              collections={collectionItems}
              isDataReady={!isLoading}
              isTogglingFavorites={isSaving}
              onCollectionToggle={handleCollectionToggle}
              onNewCollectionClick={handleNewCollectionClick}
            />
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SavePinnedToCollectionModal;
