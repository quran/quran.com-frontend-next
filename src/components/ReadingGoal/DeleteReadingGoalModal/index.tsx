import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import DeleteConfirmationModal from '@/dls/DeleteConfirmationModal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { GoalCategory } from '@/types/auth/Goal';
import { deleteReadingGoal } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';

type PropsDeleteReadingGoalModal = {
  isOpen: boolean;
  onModalChange: (visible: boolean) => void;
  onBack?: () => void;
};

const DeleteReadingGoalModal: React.FC<PropsDeleteReadingGoalModal> = ({
  isOpen,
  onModalChange,
  onBack,
}) => {
  const { t } = useTranslation('reading-progress');
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate } = useSWRConfig();
  const toast = useToast();

  const deleteReadingGoalAndClearCache = useCallback(async () => {
    await deleteReadingGoal({ category: GoalCategory.QURAN });
    mutate(makeStreakUrl());
  }, [mutate]);

  const closeModal = () => {
    if (isDeleting) return;
    onModalChange(false);
  };

  const onDeleteConfirmed = async () => {
    if (isDeleting) return;
    logButtonClick('reading_goal_confirm_delete');
    setIsDeleting(true);

    try {
      await deleteReadingGoalAndClearCache();
      toast(t('delete-goal.success'), { status: ToastStatus.Success });
      onModalChange(false);
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      title={t('delete-goal.action')}
      subtitle={t('delete-goal.confirmation.subtitle')}
      onConfirm={onDeleteConfirmed}
      onCancel={closeModal}
      onBack={onBack}
      isLoading={isDeleting}
    />
  );
};

export default DeleteReadingGoalModal;
