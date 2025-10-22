import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { getUserType } from '@/utils/auth/guestCourseEnrollment';
import { isLoggedIn } from '@/utils/auth/login';
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

  const onMarkAsCompletedClicked = () => {
    const loggedIn = isLoggedIn();
    const userType = getUserType();

    logButtonClick('mark_lesson_as_completed', {
      lessonId: id,
      userType,
    });

    // If user is a guest, redirect to login/registration
    if (!loggedIn) {
      router.push(getLoginNavigationUrl(router.asPath));
      return;
    }

    // Otherwise, mark lesson as completed for logged-in users
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
