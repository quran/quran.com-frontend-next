import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import modalStyles from './Modal.module.scss';
import styles from './NoteFormModal.module.scss';

import NotesOnVerseButton from '@/components/Notes/modal/NotesOnVerseButton';
import PostQRConfirmationModal from '@/components/Notes/modal/PostQrConfirmationModal';
import ReflectionIntro from '@/components/Notes/modal/ReflectionIntro';
import { LoadingState, useNotesStates } from '@/components/Notes/modal/useNotesStates';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import TextArea from '@/dls/Forms/TextArea';

interface NoteFormModalProps {
  notesCount?: number;
  showNotesOnVerseButton?: boolean;
  initialNote?: string;
  header: React.ReactNode;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
  onSaveNote?: ({ note, isPublic }: { note: string; isPublic: boolean }) => Promise<void>;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({
  notesCount = 0,
  showNotesOnVerseButton = true,
  initialNote = '',
  header,
  onMyNotes,
  isModalOpen,
  onModalClose,
  onSaveNote = async () => {},
}) => {
  const { t } = useTranslation();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const {
    noteInput,
    errors,
    loading,
    onNoteInputChange,
    onPrivateSave,
    onPublicSaveRequest,
    validateNoteInput,
  } = useNotesStates(initialNote, onSaveNote, onMyNotes);

  const handlePublicSaveClick = () => {
    if (validateNoteInput()) {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmationEdit = () => {
    setShowConfirmationModal(false);
  };

  const handleConfirmationConfirm = async () => {
    await onPublicSaveRequest();
    setShowConfirmationModal(false);
  };

  const handleConfirmationClose = () => {
    setShowConfirmationModal(false);
  };

  return (
    <>
      <ContentModal
        isOpen={isModalOpen && !showConfirmationModal}
        header={header}
        hasCloseButton
        onClose={onModalClose}
        onEscapeKeyDown={onModalClose}
        contentClassName={modalStyles.content}
        overlayClassName={modalStyles.overlay}
      >
        <div className={styles.container}>
          <ReflectionIntro />

          <div className={styles.inputGroup}>
            <TextArea
              id="note"
              name="note"
              placeholder={t('notes:body-placeholder')}
              containerClassName={styles.textArea}
              value={noteInput}
              onChange={onNoteInputChange}
            />

            {errors.note && <div className={styles.error}>{errors.note}</div>}
          </div>

          {showNotesOnVerseButton && notesCount > 0 && (
            <NotesOnVerseButton
              notesCount={notesCount}
              onClick={onMyNotes}
              disabled={loading !== null}
            />
          )}

          <div className={styles.actions}>
            <Button
              className={styles.rounded}
              size={ButtonSize.Small}
              variant={ButtonVariant.Simplified}
              isLoading={loading === LoadingState.Public}
              isDisabled={loading !== null}
              onClick={handlePublicSaveClick}
            >
              {t('notes:save-post-to-qr')}
            </Button>
            <Button
              className={styles.rounded}
              size={ButtonSize.Small}
              isLoading={loading === LoadingState.Private}
              isDisabled={loading !== null}
              onClick={onPrivateSave}
            >
              {t('notes:save-privately')}
            </Button>
          </div>
        </div>
      </ContentModal>

      <PostQRConfirmationModal
        isModalOpen={showConfirmationModal && isModalOpen}
        isLoading={loading === LoadingState.Public}
        onModalClose={handleConfirmationClose}
        onEdit={handleConfirmationEdit}
        onConfirm={handleConfirmationConfirm}
      />
    </>
  );
};

export default NoteFormModal;
