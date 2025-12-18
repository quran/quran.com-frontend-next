import useTranslation from 'next-translate/useTranslation';

import styles from './AddNoteModal.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';

interface NotesOnVerseButtonProps {
  notesCount: number;
  onClick?: () => void;
}

const NotesOnVerseButton: React.FC<NotesOnVerseButtonProps> = ({ notesCount, onClick }) => {
  const { t } = useTranslation('notes');

  return (
    <button type="button" className={styles.notesButton} onClick={onClick}>
      <IconContainer
        icon={<NotesWithPencilIcon />}
        color={IconColor.default}
        size={IconSize.Custom}
        className={styles.notesButtonPencil}
      />
      <span className={styles.notesButtonText}>
        {t('notes-on-this-verse', { count: notesCount })}
      </span>
      <IconContainer
        icon={<ChevronRightIcon />}
        color={IconColor.default}
        size={IconSize.Custom}
        className={styles.notesButtonChevron}
      />
    </button>
  );
};

export default NotesOnVerseButton;
