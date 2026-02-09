import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/MyQuran/DeleteCollectionModal/DeleteCollectionModal.module.scss';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Modal from '@/dls/Modal/Modal';
import CloseIcon from '@/icons/close.svg';
import { toLocalizedNumber } from '@/utils/locale';

type DeleteBookmarkModalProps = {
  isOpen: boolean;
  collectionName: string;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

const DeleteBookmarkModal: React.FC<DeleteBookmarkModalProps> = ({
  isOpen,
  collectionName,
  count,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { t, lang } = useTranslation('collection');
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
          <div className={styles.header}>
            <Modal.Title>
              <span className={styles.title}>{t('delete-bookmark.title')}</span>
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

          <hr className={styles.divider} />

          <div className={styles.content}>
            <p className={styles.subtitle}>
              {t('delete-bookmark.confirmation-subtitle', {
                count: toLocalizedNumber(count, lang),
                collectionName,
              })}
            </p>
          </div>

          <hr className={styles.divider} />

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

export default DeleteBookmarkModal;
