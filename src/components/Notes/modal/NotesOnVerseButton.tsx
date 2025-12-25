import useTranslation from 'next-translate/useTranslation';

import styles from './NoteFormModal.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';

interface NotesOnVerseButtonProps {
  notesCount: number;
  onClick?: () => void;
  disabled?: boolean;
}

const NotesOnVerseButton: React.FC<NotesOnVerseButtonProps> = ({
  notesCount,
  onClick,
  disabled,
}) => {
  const { t } = useTranslation('notes');

  return (
    <button
      type="button"
      className={styles.notesButton}
      onClick={onClick}
      disabled={disabled}
      data-testid="notes-on-verse-button"
      data-note-count={notesCount}
    >
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
