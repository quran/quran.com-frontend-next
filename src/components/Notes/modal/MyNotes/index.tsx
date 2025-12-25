import useTranslation from 'next-translate/useTranslation';

import modalStyles from '../Modal.module.scss';

import MyNotes from '@/components/Notes/modal/MyNotes/MyNotes';
import ContentModal from '@/dls/ContentModal/ContentModal';
import { Note } from '@/types/auth/Note';

interface MyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  notesCount?: number;
  verseKey: string;
}

const MyNotesModal: React.FC<MyNotesModalProps> = ({
  isOpen,
  onClose,
  onAddNote,
  onEditNote,
  notesCount = 0,
  verseKey,
}) => {
  const { t } = useTranslation('notes');

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      onEscapeKeyDown={onClose}
      hasCloseButton
      header={
        <h2
          className={modalStyles.title}
          data-testid="my-notes-modal-title"
          data-note-count={notesCount}
        >
          {t('my-notes', { count: notesCount })}
        </h2>
      }
      contentClassName={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <MyNotes onAddNote={onAddNote} onEditNote={onEditNote} verseKey={verseKey} />
    </ContentModal>
  );
};

export default MyNotesModal;
