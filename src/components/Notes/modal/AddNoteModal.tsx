import useTranslation from 'next-translate/useTranslation';

import styles from './NoteFormModal.module.scss';

import NoteFormModal from '@/components/Notes/modal/NoteFormModal';

interface AddNoteModalProps {
  notesCount?: number;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalOpen: () => void;
  onModalClose: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  notesCount = 0,
  onMyNotes,
  isModalOpen,
  onModalClose,
  onModalOpen,
}) => {
  const { t } = useTranslation('notes');

  return (
    <NoteFormModal
      header={<p className={styles.title}>{t('take-a-note-or-reflection')}</p>}
      isModalOpen={isModalOpen}
      onModalClose={onModalClose}
      onMyNotes={onMyNotes}
      notesCount={notesCount}
      onModalOpen={onModalOpen}
    />
  );
};

export default AddNoteModal;
