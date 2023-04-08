import { useCallback, useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from './DeleteReadingGoalModal.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Input from '@/dls/Forms/Input';
import Modal from '@/dls/Modal/Modal';
import { deleteReadingGoal } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';

type DeleteReadingGoalButtonProps = {
  isDisabled?: boolean;
};

const DeleteReadingGoalModal = ({ isDisabled }: DeleteReadingGoalButtonProps) => {
  const { t } = useTranslation('reading-goal');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const { cache } = useSWRConfig();

  const deleteReadingGoalAndClearCache = useCallback(() => {
    deleteReadingGoal().then(() => {
      cache.delete(makeStreakUrl());
    });
  }, [cache]);

  const closeModal = () => {
    setConfirmationText('');
    setIsModalVisible(false);
  };

  const onDeleteConfirmed = () => {
    logButtonClick('reading_goal_confirm_delete');
    closeModal();
    deleteReadingGoalAndClearCache();
  };

  const onDeleteAccountClicked = () => {
    logButtonClick('reading_goal_delete');
    setIsModalVisible(true);
  };

  const CONFIRMATION_TEXT = t('delete-confirmation.confirmation-text');
  const canDeleteGoal = confirmationText.toLowerCase() === CONFIRMATION_TEXT.toLowerCase();

  return (
    <>
      <Button
        type={ButtonType.Error}
        variant={ButtonVariant.Ghost}
        onClick={onDeleteAccountClicked}
        isDisabled={isDisabled}
      >
        {t('delete-goal')}
      </Button>
      <Modal isOpen={isModalVisible} onClickOutside={closeModal}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('delete-confirmation.title')}</Modal.Title>
            <Modal.Subtitle>{t('delete-confirmation.subtitle')}</Modal.Subtitle>

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
              id="delete-goal-confimation"
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
              isDisabled={!canDeleteGoal}
            >
              {t('delete-confirmation.action-text')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteReadingGoalModal;
