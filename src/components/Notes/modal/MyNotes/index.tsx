import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import modalStyles from '../Modal.module.scss';

import useDeleteNote from '@/components/Notes/modal/hooks/useDeleteNote';
import usePostNoteToQR from '@/components/Notes/modal/hooks/usePostNoteToQr';
import MyNotes from '@/components/Notes/modal/MyNotes/MyNotes';
import myNotesStyles from '@/components/Notes/modal/MyNotes/MyNotes.module.scss';
import PostQRConfirmationModal from '@/components/Notes/modal/PostQrConfirmationModal';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import ContentModal from '@/dls/ContentModal/ContentModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/icons/arrow.svg';
import { Note } from '@/types/auth/Note';
import ZIndexVariant from '@/types/enums/ZIndexVariant';
import { toLocalizedNumber } from '@/utils/locale';

interface MyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  notesCount?: number;
  verseKey: string;
  onBack?: () => void;
}

const MyNotesModal: React.FC<MyNotesModalProps> = ({
  isOpen,
  onClose,
  onAddNote,
  onEditNote,
  notesCount = 0,
  verseKey,
  onBack,
}) => {
  const { t, lang } = useTranslation('notes');

  const {
    showConfirmationModal,
    isPosting,
    handlePostToQrClick,
    handleNotePostToQRClose,
    handleNotePostToQR,
  } = usePostNoteToQR({ flushNotesList: true });

  const { showDeleteConfirmation, noteToDelete, isDeletingNote, handleDeleteNoteClick } =
    useDeleteNote({ flushNotesList: true });

  return (
    <>
      <ContentModal
        isOpen={isOpen && !showDeleteConfirmation && !showConfirmationModal}
        onClose={onClose}
        onEscapeKeyDown={onClose}
        hasCloseButton
        overlayClassName={modalStyles.overlay}
        headerClassName={modalStyles.headerClassName}
        closeIconClassName={modalStyles.closeIconContainer}
        contentClassName={classNames(modalStyles.content, modalStyles.myNotesModalContent)}
        innerContentClassName={myNotesStyles.container}
        dataTestId="my-notes-modal-content"
        header={
          <button
            type="button"
            className={classNames(modalStyles.headerButton, modalStyles.title)}
            onClick={onBack || onAddNote}
            data-testid="my-notes-modal-title"
            data-note-count={notesCount}
          >
            <IconContainer
              icon={<ArrowIcon />}
              shouldForceSetColors={false}
              size={IconSize.Custom}
              className={modalStyles.arrowIcon}
            />

            {t('my-notes', { count: toLocalizedNumber(notesCount, lang) })}
          </button>
        }
      >
        <MyNotes
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          verseKey={verseKey}
          onPostToQrClick={handlePostToQrClick}
          onDeleteNoteClick={handleDeleteNoteClick}
          deletingNoteId={isDeletingNote && noteToDelete ? noteToDelete.id : undefined}
          processingNoteId={noteToDelete?.id}
        />
      </ContentModal>

      <PostQRConfirmationModal
        isModalOpen={showConfirmationModal}
        isLoading={isPosting}
        onBack={handleNotePostToQRClose}
        onModalClose={handleNotePostToQRClose}
        onConfirm={handleNotePostToQR}
      />

      {isOpen && <ConfirmationModal zIndexVariant={ZIndexVariant.ULTRA} />}
    </>
  );
};

export default MyNotesModal;
