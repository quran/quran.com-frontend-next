import { useState } from 'react';

import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonType, ButtonVariant } from '../dls/Button/Button';

import styles from './DeleteAccountButton.module.scss';

import Input from '@/dls/Forms/Input';
import Modal from '@/dls/Modal/Modal';
import { deleteAccount } from '@/utils/auth/api';
import { removeLastSyncAt } from '@/utils/auth/userDataSync';
import { logButtonClick } from '@/utils/eventLogger';

type DeleteAccountButtonProps = {
  isDisabled?: boolean;
};
const DeleteAccountButton = ({ isDisabled }: DeleteAccountButtonProps) => {
  const { t } = useTranslation('profile');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const router = useRouter();

  const closeModal = () => {
    setConfirmationText('');
    setIsModalVisible(false);
  };

  const onDeleteConfirmed = async () => {
    logButtonClick('profile_confirm_delete_account');
    closeModal();

    await deleteAccount();
    removeLastSyncAt();
    router.push('/');
  };

  const onDeleteAccountClicked = () => {
    logButtonClick('profile_delete_account');
    setIsModalVisible(true);
  };

  const CONFIRMATION_TEXT = t('delete-confirmation.confirmation-text');
  const canDeleteAccount = confirmationText.toLowerCase() === CONFIRMATION_TEXT.toLowerCase();

  return (
    <>
      <Button
        type={ButtonType.Error}
        variant={ButtonVariant.Ghost}
        onClick={onDeleteAccountClicked}
        isDisabled={isDisabled}
      >
        {t('delete-account')}
      </Button>
      <Modal isOpen={isModalVisible} onClickOutside={closeModal}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('delete-confirmation.title')}</Modal.Title>
            <Modal.Subtitle>{t('delete-confirmation.subtitle')}</Modal.Subtitle>

            <p className={styles.instructionText}>
              <Trans
                i18nKey="profile:delete-confirmation.instruction-text"
                values={{ text: CONFIRMATION_TEXT }}
                components={{
                  strong: <strong className={styles.confirmationText} />,
                }}
              />
            </p>
            <Input
              id="delete-account-confirmation"
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
              isDisabled={!canDeleteAccount}
            >
              {t('delete-confirmation.action-text')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteAccountButton;
