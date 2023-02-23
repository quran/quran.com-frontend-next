import { useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './DeleteReadingGoalModal.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Input from '@/dls/Forms/Input';
import Modal from '@/dls/Modal/Modal';
import { deleteReadingGoal } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';

type DeleteReadingGoalButtonProps = {
  isDisabled?: boolean;
};

const DeleteReadingGoalModal = ({ isDisabled }: DeleteReadingGoalButtonProps) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const closeModal = () => {
    setConfirmationText('');
    setIsModalVisible(false);
  };

  const onDeleteConfirmed = () => {
    logButtonClick('reading_goal_confirm_delete');
    closeModal();
    deleteReadingGoal();
  };

  const onDeleteAccountClicked = () => {
    logButtonClick('reading_goal_delete');
    setIsModalVisible(true);
  };

  const CONFIRMATION_TEXT = t('reading-goal:delete-confirmation.confirmation-text');
  const canDeleteAccount = confirmationText.toLowerCase() === CONFIRMATION_TEXT.toLowerCase();

  return (
    <>
      <Button
        type={ButtonType.Error}
        variant={ButtonVariant.Ghost}
        onClick={onDeleteAccountClicked}
        isDisabled={isDisabled}
      >
        {t('reading-goal:delete-account')}
      </Button>
      <Modal isOpen={isModalVisible} onClickOutside={closeModal}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('reading-goal:delete-confirmation.title')}</Modal.Title>
            <Modal.Subtitle>{t('reading-goal:delete-confirmation.subtitle')}</Modal.Subtitle>

            <p className={styles.instructionText}>
              <Trans
                i18nKey="reading-goal:delete-confirmation.instruction-text"
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
              {t('reading-goal:delete-confirmation.action-text')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteReadingGoalModal;
