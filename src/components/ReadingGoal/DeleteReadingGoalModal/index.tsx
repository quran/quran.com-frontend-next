import { useCallback, useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from './DeleteReadingGoalModal.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Input from '@/dls/Forms/Input';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { GoalCategory } from '@/types/auth/Goal';
import { deleteReadingGoal } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';

type DeleteReadingGoalButtonProps = {
  isDisabled?: boolean;
};

const DeleteReadingGoalModal = ({ isDisabled }: DeleteReadingGoalButtonProps) => {
  const { t } = useTranslation('reading-progress');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const { mutate } = useSWRConfig();
  const toast = useToast();

  const deleteReadingGoalAndClearCache = useCallback(async () => {
    await deleteReadingGoal({ category: GoalCategory.QURAN });
    mutate(makeStreakUrl());
  }, [mutate]);

  const closeModal = () => {
    setConfirmationText('');
    setIsModalVisible(false);
  };

  const onDeleteConfirmed = async () => {
    logButtonClick('reading_goal_confirm_delete');
    await deleteReadingGoalAndClearCache();
    toast(t('delete-goal.success'), {
      status: ToastStatus.Success,
    });
    closeModal();
  };

  const onDeleteReadingGoalClicked = () => {
    logButtonClick('reading_goal_delete');
    setIsModalVisible(true);
  };

  const CONFIRMATION_TEXT = t('delete-goal.confirmation.confirmation-text');
  const canDeleteGoal = confirmationText.toLowerCase() === CONFIRMATION_TEXT.toLowerCase();

  return (
    <>
      <Button
        type={ButtonType.Error}
        variant={ButtonVariant.Ghost}
        onClick={onDeleteReadingGoalClicked}
        isDisabled={isDisabled}
      >
        {t('delete-goal.action')}
      </Button>
      <Modal isOpen={isModalVisible} onClickOutside={closeModal}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('delete-goal.confirmation.title')}</Modal.Title>
            <Modal.Subtitle>{t('delete-goal.confirmation.subtitle')}</Modal.Subtitle>

            <p className={styles.instructionText}>
              <Trans
                i18nKey="reading-progress:delete-goal.confirmation.instruction-text"
                values={{ text: CONFIRMATION_TEXT }}
                components={{
                  strong: <strong className={styles.confirmationText} />,
                }}
              />
            </p>
            <Input
              id="delete-goal-confirmation"
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
              {t('delete-goal.confirmation.action-text')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteReadingGoalModal;
