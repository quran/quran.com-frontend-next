import { useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import router from 'next/router';
import { mutate } from 'swr';

import Button, { ButtonType, ButtonVariant } from '../dls/Button/Button';
import Input from '../dls/Forms/Input';
import Modal from '../dls/Modal/Modal';

import styles from './DeleteAccountButton.module.scss';

import { deleteAccount } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';

const DeleteAccountButton = () => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const closeModal = () => {
    setConfirmationText('');
    setIsModalVisible(false);
  };

  const onDeleteConfirmed = () => {
    closeModal();
    deleteAccount()
      .then(() => fetch('/api/auth/logout'))
      .then(() => mutate(makeUserProfileUrl()))
      .then(() => router.push('/'));
  };

  const CONFIRMATION_TEXT = t('profile:delete-confirmation.confirmation-text');
  const canDeleteAccount = confirmationText.toLowerCase() === CONFIRMATION_TEXT.toLowerCase();

  return (
    <>
      <Button
        type={ButtonType.Error}
        variant={ButtonVariant.Ghost}
        onClick={() => setIsModalVisible(true)}
      >
        {t('profile:delete-account')}
      </Button>
      <Modal isOpen={isModalVisible} onClickOutside={closeModal}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('profile:delete-confirmation.title')}</Modal.Title>
            <Modal.Subtitle>{t('profile:delete-confirmation.subtitle')}</Modal.Subtitle>

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
              id="delete-account-confimation"
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
              {t('profile:delete-confirmation.action-text')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteAccountButton;
