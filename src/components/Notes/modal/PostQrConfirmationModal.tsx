import useTranslation from 'next-translate/useTranslation';

import modalStyles from './Modal.module.scss';
import styles from './PostQrConfirmationModal.module.scss';

import PostReflectionDescription from '@/components/Notes/modal/ReflectionIntro/PostReflection';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';

interface PostQRConfirmationModalProps {
  isModalOpen: boolean;
  isLoading: boolean;
  onModalClose: () => void;
  onEdit: () => void;
  onConfirm: () => void;
}

const PostQRConfirmationModal: React.FC<PostQRConfirmationModalProps> = ({
  isModalOpen,
  isLoading,
  onModalClose,
  onEdit,
  onConfirm,
}) => {
  const { t } = useTranslation('notes');

  return (
    <ContentModal
      isOpen={isModalOpen}
      header={<h2 className={modalStyles.title}>{t('take-a-note-or-reflection')}</h2>}
      hasCloseButton
      onClose={onModalClose}
      onEscapeKeyDown={onModalClose}
      contentClassName={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <div className={styles.container}>
        <p className={styles.question}>{t('post-confirmation.question')}</p>

        <PostReflectionDescription />

        <div className={styles.actions}>
          <Button
            className={styles.editButton}
            size={ButtonSize.Small}
            variant={ButtonVariant.Simplified}
            onClick={onEdit}
            isDisabled={isLoading}
          >
            {t('common:edit')}
          </Button>
          <Button
            className={styles.confirmButton}
            variant={ButtonVariant.Accent}
            size={ButtonSize.Small}
            onClick={onConfirm}
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            {t('save-post-to-qr')}
          </Button>
        </div>
      </div>
    </ContentModal>
  );
};

export default PostQRConfirmationModal;
