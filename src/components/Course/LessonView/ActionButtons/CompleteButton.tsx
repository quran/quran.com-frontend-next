import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { isLoggedIn, getUserType } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

type Props = {
  isLoading: boolean;
  id: string;
  markLessonAsCompleted: (lessonId: string, successCallback?: () => void) => void;
};

const CompleteButton: React.FC<Props> = ({ isLoading, id, markLessonAsCompleted }) => {
  const { t } = useTranslation('learn');
  const toast = useToast();
  const router = useRouter();
  const userIsLoggedIn = isLoggedIn();

  const onMarkAsCompletedClicked = () => {
    const userType = getUserType();
    logButtonClick('mark_lesson_as_completed', {
      lessonId: id,
      userType,
    });

    if (!userIsLoggedIn) {
      router.replace(getLoginNavigationUrl(router.asPath));
      return;
    }
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
      size={ButtonSize.Small}
      onClick={onMarkAsCompletedClicked}
    >
      {t('mark-complete')}
    </Button>
  );
};

export default CompleteButton;
