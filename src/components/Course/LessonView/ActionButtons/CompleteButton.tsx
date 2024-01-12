import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import TickIcon from '@/icons/tick.svg';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  isLoading: boolean;
  id: string;
  markLessonAsCompleted: (lessonId: string, successCallback?: () => void) => void;
};

const CompleteButton: React.FC<Props> = ({ isLoading, id, markLessonAsCompleted }) => {
  const { t } = useTranslation('learn');
  const toast = useToast();

  const onMarkAsCompletedClicked = () => {
    logButtonClick('mark_lesson_as_completed', {
      lessonId: id,
    });
    markLessonAsCompleted(id, () => {
      toast(t('mark-complete-success'), {
        status: ToastStatus.Success,
      });
    });
  };
  return (
    <Button
      isLoading={isLoading}
      isDisabled={isLoading}
      prefix={<TickIcon />}
      size={ButtonSize.Small}
      onClick={onMarkAsCompletedClicked}
    >
      {t('mark-complete')}
    </Button>
  );
};

export default CompleteButton;
