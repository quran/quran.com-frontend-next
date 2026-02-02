import useTranslation from 'next-translate/useTranslation';

import styles from './DeleteCollectionModal.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Modal from '@/dls/Modal/Modal';
import CloseIcon from '@/icons/close.svg';

interface DeleteCollectionModalProps {
  isOpen: boolean;
  collectionName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteCollectionModal: React.FC<DeleteCollectionModalProps> = ({
  isOpen,
  collectionName,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation('collection');
  const { t: commonT } = useTranslation('common');

  return (
    <Modal
      isOpen={isOpen}
      onClickOutside={onCancel}
      onEscapeKeyDown={onCancel}
      contentClassName={styles.modal}
    >
      <Modal.Body>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <Modal.Title>
              <span className={styles.title}>{t('delete-collection.title')}</span>
            </Modal.Title>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onCancel}
              aria-label={commonT('close')}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Divider */}
          <hr className={styles.divider} />

          {/* Content - Two paragraphs */}
          <div className={styles.content}>
            <p className={styles.subtitle}>
              {t('delete-collection.subtitle')}{' '}
              <span className={styles.collectionName}>{collectionName}</span>?
            </p>
            <p className={styles.description}>{t('delete-collection.description')}</p>
          </div>

          {/* Divider */}
          <hr className={styles.divider} />

          {/* Footer with buttons */}
          <div className={styles.footer}>
            <Button
              variant={ButtonVariant.Outlined}
              size={ButtonSize.Medium}
              onClick={onCancel}
              className={styles.cancelButton}
            >
              {commonT('cancel')}
            </Button>
            <Button
              type={ButtonType.Error}
              size={ButtonSize.Medium}
              onClick={onConfirm}
              className={styles.deleteButton}
              isLoading={isLoading}
            >
              {commonT('delete')}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteCollectionModal;
