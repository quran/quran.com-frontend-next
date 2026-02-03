import Trans from 'next-translate/Trans';
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
              disabled={isLoading}
              onClick={onCancel}
              aria-disabled={isLoading}
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
              <Trans
                i18nKey="delete-collection.subtitle-tagged"
                ns="collection"
                components={{ collectionName: <span className={styles.collectionName} /> }}
                values={{ collectionName }}
              />
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
              isDisabled={isLoading}
              aria-disabled={isLoading}
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
              isDisabled={isLoading}
              aria-disabled={isLoading}
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
