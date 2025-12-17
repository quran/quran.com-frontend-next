import useTranslation from 'next-translate/useTranslation';

import styles from './SaveBookmarkModal.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import NoteIcon from '@/icons/notes-with-pencil.svg';

interface SaveBookmarkModalFooterProps {
  /** Whether to show the "Take a Note" button */
  showNoteButton: boolean;
  /** Handler called when "Take a Note" button is clicked */
  onTakeNote: () => void;
  /** Handler called when "Done" button is clicked */
  onDone: () => void;
}

/**
 * Footer component for SaveBookmarkModal.
 * Contains the "Take a Note" and "Done" action buttons.
 * @param {SaveBookmarkModalFooterProps} props - Props for the SaveBookmarkModalFooter component
 * @returns {JSX.Element} The SaveBookmarkModalFooter component
 */
const SaveBookmarkModalFooter: React.FC<SaveBookmarkModalFooterProps> = ({
  showNoteButton,
  onTakeNote,
  onDone,
}) => {
  const { t } = useTranslation('quran-reader');
  const { t: commonT } = useTranslation('common');

  return (
    <div className={styles.footer}>
      {showNoteButton && (
        <Button
          variant={ButtonVariant.Outlined}
          size={ButtonSize.Medium}
          onClick={onTakeNote}
          className={styles.noteButton}
        >
          <NoteIcon />
          {t('take-a-note')}
        </Button>
      )}
      <Button
        type={ButtonType.Primary}
        size={ButtonSize.Medium}
        onClick={onDone}
        className={styles.doneButton}
      >
        {commonT('done')}
      </Button>
    </div>
  );
};

export default SaveBookmarkModalFooter;
