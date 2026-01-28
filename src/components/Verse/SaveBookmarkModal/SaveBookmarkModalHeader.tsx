import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './SaveBookmarkModal.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Modal from '@/dls/Modal/Modal';
import ArrowIcon from '@/icons/arrow.svg';
import CloseIcon from '@/icons/close.svg';

interface SaveBookmarkModalHeaderProps {
  /** Title to display in the header */
  title: string;
  /** Handler called when close button is clicked */
  onClose: () => void;
  /** Optional handler called when back button is clicked */
  onBack?: () => void;
}

/**
 * Header component for SaveBookmarkModal.
 * Displays the modal title, back button (if provided), and close button.
 * @param {SaveBookmarkModalHeaderProps} props - Props for the SaveBookmarkModalHeader component
 * @returns {JSX.Element} The SaveBookmarkModalHeader component
 */
const SaveBookmarkModalHeader: React.FC<SaveBookmarkModalHeaderProps> = ({
  title,
  onClose,
  onBack,
}) => {
  const { t } = useTranslation('common');

  return (
    <>
      <div className={styles.header}>
        <Modal.Title>
          {onBack ? (
            <button
              type="button"
              className={classNames(styles.title, styles.backButton)}
              onClick={onBack}
            >
              <IconContainer
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                size={IconSize.Custom}
                className={styles.arrowIcon}
              />
              <span>{title}</span>
            </button>
          ) : (
            <span className={styles.title}>{title}</span>
          )}
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
