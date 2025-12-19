import useTranslation from 'next-translate/useTranslation';

import modalStyles from './Modal.module.scss';

import NoteFormModal from '@/components/Notes/modal/NoteFormModal';

interface AddNoteModalProps {
  notesCount?: number;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  notesCount = 0,
  onMyNotes,
  isModalOpen,
  onModalClose,
}) => {
  const { t } = useTranslation('notes');

  return (
    <NoteFormModal
      header={<p className={modalStyles.title}>{t('take-a-note-or-reflection')}</p>}
      isModalOpen={isModalOpen}
      onModalClose={onModalClose}
      onMyNotes={onMyNotes}
      notesCount={notesCount}
    />
  );
};

export default AddNoteModal;
