import useTranslation from 'next-translate/useTranslation';

import styles from './SaveBookmarkModal.module.scss';

import Modal from '@/dls/Modal/Modal';
import CloseIcon from '@/icons/close.svg';

interface SaveBookmarkModalHeaderProps {
  /** Title to display in the header */
  title: string;
  /** Handler called when close button is clicked */
  onClose: () => void;
}

/**
 * Header component for SaveBookmarkModal.
 * Displays the modal title and close button.
 * @param {SaveBookmarkModalHeaderProps} props - Props for the SaveBookmarkModalHeader component
 * @returns {JSX.Element} The SaveBookmarkModalHeader component
 */
const SaveBookmarkModalHeader: React.FC<SaveBookmarkModalHeaderProps> = ({ title, onClose }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <div className={styles.header}>
        <Modal.Title>
          <span className={styles.title} data-testid="save-bookmark-modal-title">
            {title}
          </span>
        </Modal.Title>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={t('close')}
        >
          <CloseIcon />
        </button>
      </div>
      <hr className={styles.divider} />
    </>
  );
};

export default SaveBookmarkModalHeader;
