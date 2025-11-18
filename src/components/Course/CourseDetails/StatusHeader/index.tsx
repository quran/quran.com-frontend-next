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
import useEnrollUser from '@/hooks/auth/useEnrollUser';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import { logErrorToSentry } from '@/lib/sentry';
import { Course } from '@/types/auth/Course';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
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
  const userLoggedIn = isLoggedIn();
  const enrollUserInCourse = useEnrollUser();

  const onStartHereClicked = async (): Promise<void> => {
    const userType = getUserType(userLoggedIn);

    logButtonClick('course_enroll', {
      courseId: id,
      isCTA,
      userType,
    });

    // Guest user handling
    if (!userLoggedIn) {
      if (allowGuestAccess && lessons?.length > 0) {
        router.push(getLessonNavigationUrl(slug, lessons[0].slug));
      } else {
        router.push(getLoginNavigationUrl(getCourseNavigationUrl(slug)));
      }
      return;
    }

    // Logged-in user - enroll with MANUAL method
    setIsLoading(true);
    try {
      await enrollUserInCourse(id, EnrollmentMethod.Manual);

      mutate(makeGetCourseUrl(slug), (currentCourse: Course) => ({
        ...currentCourse,
        isUserEnrolled: true,
      }));

      if (lessons?.length > 0) {
        await router.push(getLessonNavigationUrl(slug, lessons[0].slug));
      }
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

  // CTA mode - only show button if not enrolled
  if (isCTA) {
    if (isUserEnrolled) {
      return <></>;
    }
    return (
      <Button isDisabled={isLoading} isLoading={isLoading} onClick={onStartHereClicked}>
        {t('start-here')}
      </Button>
    );
  }

  // Course is completed
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

  // User is enrolled - show StartOrContinueLearning component
  if (isUserEnrolled) {
    return <StartOrContinueLearning course={course} />;
  }

  // Not enrolled - show "Start here" button
  return (
    <Button isDisabled={isLoading} isLoading={isLoading} onClick={onStartHereClicked}>
      {t('start-here')}
    </Button>
  );
};

export default StatusHeader;
