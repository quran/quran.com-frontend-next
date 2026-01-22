import useTranslation from 'next-translate/useTranslation';

import NewCollectionForm from './Collections/NewCollectionForm';
import styles from './SaveBookmarkModal.module.scss';
import SaveBookmarkModalContent from './SaveBookmarkModalContent';
import useSaveBookmarkModal from './useSaveBookmarkModal';

import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import { ReadingBookmarkType } from '@/types/Bookmark';
import Word from '@/types/Word';

export { ReadingBookmarkType as SaveBookmarkType };

interface SaveBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ReadingBookmarkType;
  verse?: Word;
  pageNumber?: number;
}

/**
 * Modal component for saving a verse/page to collections and setting reading bookmark.
 * Uses custom hooks for logic extraction and sub-components for UI composition.
 * @param {SaveBookmarkModalProps} props - Props for the SaveBookmarkModal component
 * @returns {JSX.Element} The SaveBookmarkModal component
 */
const SaveBookmarkModal: React.FC<SaveBookmarkModalProps> = ({
  isOpen,
  onClose,
  type,
  verse,
  pageNumber,
}) => {
  const { lang } = useTranslation('quran-reader');

  const {
    isTogglingFavorites,
    isCreatingCollection,
    newCollectionName,
    isSubmittingCollection,
    sortedCollections,
    isDataReady,
    userIsLoggedIn,
    mushafId,
    isVerse,
    isPage,
    verseKey,
    modalTitle,
    resourceBookmark,
    readingBookmarkData,
    mutateReadingBookmark,
    setNewCollectionName,
    handleReadingBookmarkChanged,
    handleCollectionToggle,
    handleNewCollectionClick,
    handleBackFromNewCollection,
    handleCancelNewCollection,
    handleCreateCollection,
    handleTakeNote,
    handleGuestSignIn,
  } = useSaveBookmarkModal({
    type,
    verse,
    pageNumber,
    onClose,
  });

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
            onBack={handleBackFromNewCollection}
            onClose={onClose}
            onCancel={handleCancelNewCollection}
            onCreate={handleCreateCollection}
            newCollectionName={newCollectionName}
            onNameChange={setNewCollectionName}
            isSubmittingCollection={isSubmittingCollection}
          />
        ) : (
          <SaveBookmarkModalContent
            modalTitle={modalTitle}
            onClose={onClose}
            isVerse={isVerse}
            isPage={isPage}
            verseKey={verseKey}
            pageNumber={pageNumber}
            userIsLoggedIn={userIsLoggedIn}
            mushafId={mushafId}
            lang={lang}
            resourceBookmark={resourceBookmark}
            readingBookmarkData={readingBookmarkData}
            mutateReadingBookmark={mutateReadingBookmark}
            onReadingBookmarkChanged={handleReadingBookmarkChanged}
            sortedCollections={sortedCollections}
            isDataReady={isDataReady}
            isTogglingFavorites={isTogglingFavorites}
            onCollectionToggle={handleCollectionToggle}
            onNewCollectionClick={handleNewCollectionClick}
            onGuestSignIn={handleGuestSignIn}
            onTakeNote={handleTakeNote}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SaveBookmarkModal;
