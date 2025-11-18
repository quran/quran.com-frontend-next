/* eslint-disable react-func/max-lines-per-function */
import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './StatusHeader.module.scss';

import StartOrContinueLearning from '@/components/Course/Buttons/StartOrContinueLearning';
import CourseFeedback, { FeedbackSource } from '@/components/Course/CourseFeedback';
import Button from '@/dls/Button/Button';
import Pill from '@/dls/Pill';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { useEnrollGuest, useIsEnrolled } from '@/hooks/auth/useGuestEnrollment';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import { logErrorToSentry } from '@/lib/sentry';
import { Course } from '@/types/auth/Course';
import { enrollUser } from '@/utils/auth/api';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';
import { getUserType, isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getCourseNavigationUrl,
  getLessonNavigationUrl,
  getLoginNavigationUrl,
} from '@/utils/navigation';

type Props = {
  course: Course;
  isCTA?: boolean;
};

const StatusHeader: React.FC<Props> = ({ course, isCTA = false }) => {
  const { title, id, isUserEnrolled, slug, isCompleted, lessons, allowGuestAccess } = course;
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { t } = useTranslation('learn');
  const mutate = useMutateWithoutRevalidation();
  const enrollGuest = useEnrollGuest();
  const isEnrolled = useIsEnrolled(id, isUserEnrolled);
  const userLoggedIn = isLoggedIn();

  const handleEnrollmentSuccess = async (loggedIn: boolean): Promise<void> => {
    toast(t('enroll-success', { title }), { status: ToastStatus.Success });
    if (loggedIn) {
      mutate(makeGetCourseUrl(slug), (currentCourse: Course) => ({
        ...currentCourse,
        isUserEnrolled: true,
      }));
    }

    if (lessons?.length > 0) {
      await router.replace(getLessonNavigationUrl(slug, lessons[0].slug));
    }
  };

  const onEnrollClicked = async (): Promise<void> => {
    const userType = getUserType(userLoggedIn);

    logButtonClick('course_enroll', {
      courseId: id,
      isCTA,
      userType,
    });

    if (!userLoggedIn && !allowGuestAccess) {
      const redirectUrl = getCourseNavigationUrl(slug);
      router.replace(getLoginNavigationUrl(redirectUrl));
      return;
    }

    setIsLoading(true);
    try {
      if (userLoggedIn) {
        await enrollUser(id);
      } else {
        enrollGuest(id);
      }
      await handleEnrollmentSuccess(userLoggedIn);
    } catch (error) {
      logErrorToSentry(error, {
        metadata: {
          context: `${userType}_course_enrollment`,
          courseId: id,
          courseSlug: slug,
        },
      });
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCTA) {
    if (isEnrolled) {
      return <></>;
    }
    return (
      <Button isDisabled={isLoading} isLoading={isLoading} onClick={onEnrollClicked}>
        {t('enroll')}
      </Button>
    );
  }
  if (isCompleted) {
    return (
      <div className={styles.completedContainer}>
        <Pill>{t('completed')}</Pill>
        {course?.userHasFeedback === false && (
          <CourseFeedback course={course} source={FeedbackSource.CoursePage} />
        )}
      </div>
    );
  }
  if (isEnrolled) {
    return <StartOrContinueLearning course={course} />;
  }

  return (
    <Button isDisabled={isLoading} isLoading={isLoading} onClick={onEnrollClicked}>
      {t('enroll')}
    </Button>
  );
};

export default StatusHeader;
