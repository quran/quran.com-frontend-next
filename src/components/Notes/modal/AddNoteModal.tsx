import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './AddNoteModal.module.scss';
import modalStyles from './Modal.module.scss';

import NotesOnVerseButton from '@/components/Notes/modal/NotesOnVerseButton';
import ReflectionIntro from '@/components/Notes/modal/ReflectionIntro';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import TextArea from '@/dls/Forms/TextArea';

interface NoteModalProps {
  notesCount?: number;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalOpen: () => void;
  onModalClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({
  notesCount = 0,
  onMyNotes,
  isModalOpen,
  onModalClose,
}) => {
  const { t } = useTranslation('notes');

  const [noteInput, setNoteInput] = useState('');
  const errors: Record<string, string> = {};

  return (
    <ContentModal
      isOpen={isModalOpen}
      header={<p className={styles.title}>{t('notes:take-a-note-or-reflection')}</p>}
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
            id="body"
            name="body"
            placeholder={t('body-placeholder')}
            containerClassName={styles.textArea}
            value={noteInput}
            onChange={setNoteInput}
          />

          {errors.note && <div className={styles.error}>{errors.note}</div>}
        </div>

        {notesCount > 0 && <NotesOnVerseButton notesCount={notesCount} onClick={onMyNotes} />}

        <div className={styles.actions}>
          <Button
            className={styles.rounded}
            size={ButtonSize.Small}
            variant={ButtonVariant.SimplifiedAccent}
          >
            {t('save-post-to-qr')}
          </Button>
          <Button className={styles.rounded} size={ButtonSize.Small}>
            {t('save-privately')}
          </Button>
        </div>
      </div>
    </ContentModal>
  );
};

export default NoteModal;
