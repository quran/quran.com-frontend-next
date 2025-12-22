import { useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '../dls/Button/Button';

import styles from './DeleteProfilePictureButton.module.scss';

import Input from '@/dls/Forms/Input';
import Modal from '@/dls/Modal/Modal';
import { logButtonClick } from '@/utils/eventLogger';

type DeleteProfilePictureButtonProps = {
  isRemoving: boolean;
  isProcessing: boolean;
  onRemovePicture: () => void;
};

const DeleteProfilePictureButton = ({
  isRemoving,
  isProcessing,
  onRemovePicture,
}: DeleteProfilePictureButtonProps) => {
  const { t } = useTranslation('profile');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const closeModal = () => {
    setConfirmationText('');
    setIsModalVisible(false);
  };

  const onDeleteConfirmed = async () => {
    logButtonClick('profile_confirm_delete_profile_picture');
    onRemovePicture();
    closeModal();
  };

  const onDeleteProfilePictureClicked = () => {
    logButtonClick('profile_delete_profile_picture');
    setIsModalVisible(true);
  };

  const CONFIRMATION_TEXT = t('delete-profile-picture.confirmation-text');
  const canDeleteProfilePicture =
    confirmationText.toLowerCase() === CONFIRMATION_TEXT.toLowerCase();

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

            <p className={styles.instructionText}>
              <Trans
                i18nKey="profile:delete-profile-picture.instruction-text"
                values={{ text: CONFIRMATION_TEXT }}
                components={{
                  strong: <strong className={styles.confirmationText} />,
                }}
              />
            </p>
            <Input
              id="delete-profile-picture-confirmation"
              value={confirmationText}
              onChange={setConfirmationText}
              fixedWidth={false}
              containerClassName={styles.inputContainer}
            />
          </Modal.Header>
          <Modal.Footer>
            <Button
              type={ButtonType.Error}
              variant={ButtonVariant.Outlined}
              className={styles.deleteButton}
              onClick={onDeleteConfirmed}
              isDisabled={!canDeleteProfilePicture}
            >
              {t('delete-profile-picture.action-text')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteProfilePictureButton;
