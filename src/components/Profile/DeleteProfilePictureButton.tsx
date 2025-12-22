import { FC, useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '../dls/Button/Button';

import styles from './DeleteProfilePictureButton.module.scss';

import Modal from '@/dls/Modal/Modal';
import { logButtonClick } from '@/utils/eventLogger';

type DeleteProfilePictureButtonProps = {
  isRemoving: boolean;
  isProcessing: boolean;
  onRemovePicture: () => void;
};

const DeleteProfilePictureButton: FC<DeleteProfilePictureButtonProps> = ({
  isRemoving,
  isProcessing,
  onRemovePicture,
}: DeleteProfilePictureButtonProps) => {
  const { t } = useTranslation('profile');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const onDeleteConfirmed = useCallback(() => {
    logButtonClick('profile_confirm_delete_profile_picture');
    onRemovePicture();
    closeModal();
  }, [onRemovePicture, closeModal]);

  const onDeleteProfilePictureClicked = useCallback(() => {
    logButtonClick('profile_delete_profile_picture');
    setIsModalVisible(true);
  }, []);

  return (
    <>
      <Button
        variant={ButtonVariant.Compact}
        size={ButtonSize.Small}
        className={styles.profilePictureActionButton}
        onClick={onDeleteProfilePictureClicked}
        isLoading={isRemoving}
        isDisabled={isProcessing || isRemoving}
      >
        {t('remove-picture')}
      </Button>
      <Modal isOpen={isModalVisible} onClickOutside={closeModal}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('delete-profile-picture.title')}</Modal.Title>
            <Modal.Subtitle>{t('delete-profile-picture.subtitle')}</Modal.Subtitle>
          </Modal.Header>
          <Modal.Footer>
            <div className={styles.deleteProfilePictureFooter}>
              <Button
                variant={ButtonVariant.Outlined}
                className={styles.actionButton}
                onClick={closeModal}
              >
                {t('delete-profile-picture.cancel-text')}
              </Button>
              <Button
                type={ButtonType.Error}
                variant={ButtonVariant.Outlined}
                className={styles.actionButton}
                onClick={onDeleteConfirmed}
                isDisabled={isRemoving}
              >
                {t('delete-profile-picture.action-text')}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteProfilePictureButton;
