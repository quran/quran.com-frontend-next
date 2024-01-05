/* eslint-disable react-func/max-lines-per-function */
import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import Button from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import { Course } from '@/types/auth/Course';
import { postEnrollUser } from '@/utils/auth/api';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

type Props = {
  course: Course;
};

const StatusHeader: React.FC<Props> = ({ course }) => {
  const { title, id, isUserEnrolled, slug, isCompleted } = course;
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { t } = useTranslation('learn');
  const mutate = useMutateWithoutRevalidation();

  const onEnrollClicked = () => {
    if (isLoggedIn()) {
      logButtonClick('user_enroll_course', { courseId: id });
      setIsLoading(true);
      postEnrollUser(course.id)
        .then(() => {
          toast(
            t('enroll-success', {
              title,
            }),
            {
              status: ToastStatus.Success,
            },
          );
          mutate(makeGetCourseUrl(slug, { withLessons: true }), (currentCourse: Course) => {
            return {
              ...currentCourse,
              isUserEnrolled: true,
            };
          });
        })
        .catch(() => {
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      logButtonClick('guest_enroll_course', { courseId: id });
      router.replace(getLoginNavigationUrl());
    }
  };

  if (isCompleted) {
    return <>{`✔️ ${t('completed')}`}</>;
  }
  if (isUserEnrolled === true) {
    return <>{t('enrolled')}</>;
  }

  return (
    <Button isDisabled={isLoading} isLoading={isLoading} onClick={onEnrollClicked}>
      {t('enroll')}
    </Button>
  );
};

export default StatusHeader;
