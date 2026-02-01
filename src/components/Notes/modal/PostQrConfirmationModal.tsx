import useTranslation from 'next-translate/useTranslation';

import modalStyles from './Modal.module.scss';
import styles from './PostQrConfirmationModal.module.scss';

import Header from '@/components/Notes/modal/Header';
import PostReflectionIntro from '@/components/Notes/modal/ReflectionIntro/PostReflection';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';

interface PostQRConfirmationModalProps {
  isModalOpen: boolean;
  isLoading: boolean;
  onBack?: () => void;
  onModalClose: () => void;
  onEdit?: () => void;
  onConfirm: () => void;
}

const PostQRConfirmationModal: React.FC<PostQRConfirmationModalProps> = ({
  isModalOpen,
  isLoading,
  onBack,
  onModalClose,
  onEdit,
  onConfirm,
}) => {
  const { t } = useTranslation('notes');

  return (
    <ContentModal
      isOpen={isModalOpen}
      header={
        <Header
          onClick={onBack}
          data-testid="qr-confirmation-modal-title"
          aria-label={t('common:back')}
        >
          {t('take-a-note-or-reflection')}
        </Header>
      }
      hasCloseButton
      onClose={onModalClose}
      onEscapeKeyDown={onModalClose}
      contentClassName={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      headerClassName={modalStyles.headerClassName}
      closeIconClassName={modalStyles.closeIconContainer}
    >
      <div className={styles.container} data-testid="qr-confirmation-modal-content">
        <p className={styles.question}>{t('post-confirmation.question')}</p>

        <PostReflectionIntro />

        <div className={styles.actions}>
          {onEdit && (
            <Button
              className={styles.editButton}
              size={ButtonSize.Small}
              variant={ButtonVariant.Simplified}
              onClick={onEdit}
              isDisabled={isLoading}
              data-testid="edit-confirmation-button"
            >
              {t('common:edit')}
            </Button>
          )}
          <Button
            className={styles.confirmButton}
            variant={ButtonVariant.Accent}
            size={ButtonSize.Small}
            onClick={onConfirm}
            isLoading={isLoading}
            isDisabled={isLoading}
            data-testid="confirm-save-to-qr"
          >
            {t('save-post-to-qr')}
          </Button>
        </div>
      </div>
    </ContentModal>
  );
};

export default PostQRConfirmationModal;
