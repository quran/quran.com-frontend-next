import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import modalStyles from './Modal.module.scss';
import styles from './NoteFormModal.module.scss';

import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/icons/arrow.svg';
import { Note } from '@/types/auth/Note';

interface EditNoteModalProps {
  note: Note;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  note,
  onMyNotes,
  isModalOpen,
  onModalClose,
}) => {
  const { t } = useTranslation('notes');
  const key = `note-${note?.id}-${note?.body}`;

  return (
    <NoteFormModal
      key={key}
      initialNote={note?.body || ''}
      ranges={note?.ranges}
      isModalOpen={isModalOpen}
      onModalClose={onModalClose}
      onMyNotes={onMyNotes}
      showNotesOnVerseButton={false}
      header={
        <button
          type="button"
          className={classNames(styles.headerButton, modalStyles.title)}
          onClick={onMyNotes}
          aria-label={t('common:back')}
        >
          <IconContainer
            icon={<ArrowIcon />}
            shouldForceSetColors={false}
            size={IconSize.Custom}
            className={styles.editIcon}
          />
          {t('edit-note')}
        </button>
      }
    />
  );
};

export default EditNoteModal;
