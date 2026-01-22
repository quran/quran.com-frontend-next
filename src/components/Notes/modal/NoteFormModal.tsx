import { useCallback, useContext, useMemo, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import modalStyles from './Modal.module.scss';
import styles from './NoteFormModal.module.scss';

import NotesOnVerseButton from '@/components/Notes/modal/NotesOnVerseButton';
import PostQRConfirmationModal from '@/components/Notes/modal/PostQrConfirmationModal';
import ReflectionIntro from '@/components/Notes/modal/ReflectionIntro';
import { LoadingState, useNotesStates } from '@/components/Notes/modal/useNotesStates';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import TextArea from '@/dls/Forms/TextArea';
import { readableVerseRangeKeys } from '@/utils/verseKeys';

interface NoteFormModalProps {
  notesCount?: number;
  showNotesOnVerseButton?: boolean;
  initialNote?: string;
  ranges?: string[];
  header: React.ReactNode;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
  onSaveNote: ({ note, isPublic }: { note: string; isPublic: boolean }) => Promise<void>;
  dataTestId?: string;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({
  notesCount = 0,
  showNotesOnVerseButton = true,
  initialNote = '',
  ranges,
  header,
  onMyNotes,
  isModalOpen,
  onModalClose,
  onSaveNote,
  dataTestId,
}) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const {
    noteInput,
    errors,
    loading,
    onNoteInputChange,
    onPrivateSave,
    onPublicSaveRequest,
    validateNoteInput,
  } = useNotesStates(initialNote, onSaveNote, onMyNotes, isModalOpen);

  const handlePublicSaveClick = useCallback(() => {
    if (validateNoteInput()) {
      setShowConfirmationModal(true);
    }
  }, [validateNoteInput]);

  const handleConfirmationBack = useCallback(() => {
    setShowConfirmationModal(false);
  }, []);

  const handleConfirmationConfirm = useCallback(async () => {
    await onPublicSaveRequest();
    setShowConfirmationModal(false);
  }, [onPublicSaveRequest]);

  const verseRanges = useMemo(() => {
    if (!ranges || ranges.length === 0) return [];
    return readableVerseRangeKeys(ranges, chaptersData, lang);
  }, [ranges, chaptersData, lang]);

  return (
    <>
      <ContentModal
        isOpen={isModalOpen && !showConfirmationModal}
        header={header}
        hasCloseButton
        onClose={onModalClose}
        onEscapeKeyDown={onModalClose}
        overlayClassName={modalStyles.overlay}
        headerClassName={modalStyles.headerClassName}
        closeIconClassName={modalStyles.closeIconContainer}
        contentClassName={classNames(modalStyles.content, modalStyles.formModalContent)}
        innerContentClassName={classNames(styles.container, modalStyles.formModalContent)}
        dataTestId={dataTestId}
      >
        <ReflectionIntro />

        {verseRanges.length > 0 && (
          <div className={styles.verseRangesContainer}>
            {verseRanges.map((range) => (
              <span key={range} className={styles.verseRangePill}>
                {range}
              </span>
            ))}
          </div>
        )}

        <div className={styles.inputGroup}>
          <TextArea
            id="note"
            name="note"
            placeholder={t('notes:body-placeholder')}
            containerClassName={styles.textArea}
            value={noteInput}
            onChange={onNoteInputChange}
            dataTestId="notes-textarea"
          />

          {errors.note && (
            <div className={styles.error} data-testid={`note-input-error-${errors.note.id}`}>
              {errors.note.message}
            </div>
          )}
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
            className={classNames(styles.button, styles.saveToQrButton)}
            size={ButtonSize.Small}
            variant={ButtonVariant.Simplified}
            isLoading={loading === LoadingState.Public}
            isDisabled={loading !== null}
            onClick={handlePublicSaveClick}
            data-testid="save-to-qr-button"
          >
            {t('notes:save-post-to-qr')}
          </Button>
          <Button
            className={classNames(styles.button)}
            size={ButtonSize.Small}
            isLoading={loading === LoadingState.Private}
            isDisabled={loading !== null}
            onClick={onPrivateSave}
            data-testid="save-private-button"
          >
            {t('notes:save-privately')}
          </Button>
        </div>
      </ContentModal>

      <PostQRConfirmationModal
        isModalOpen={showConfirmationModal && isModalOpen}
        isLoading={loading === LoadingState.Public}
        onModalClose={handleConfirmationBack}
        onEdit={handleConfirmationBack}
        onConfirm={handleConfirmationConfirm}
      />
    </>
  );
};

export default NoteFormModal;
