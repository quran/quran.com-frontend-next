import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './StatusHeader.module.scss';

import StartOrContinueLearning from '@/components/Course/Buttons/StartOrContinueLearning';
import CourseFeedback, { FeedbackSource } from '@/components/Course/CourseFeedback';
import Button from '@/dls/Button/Button';
import Pill from '@/dls/Pill';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useCourseEnrollment from '@/hooks/auth/useCourseEnrollment';
import { Course } from '@/types/auth/Course';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
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
  const { id, isUserEnrolled, slug, isCompleted, lessons, allowGuestAccess } = course;
  const toast = useToast();
  const router = useRouter();
  const { t } = useTranslation('learn');
  const { enroll, isEnrolling } = useCourseEnrollment(slug);

  const navigateToFirstLesson = (): void => {
    if (lessons?.length > 0) {
      router.push(getLessonNavigationUrl(slug, lessons[0].slug));
    }
  };

  const handleEnrollAndNavigate = async (): Promise<void> => {
    const result = await enroll(id, EnrollmentMethod.MANUAL);

    switch (result.status) {
      case 'success':
        navigateToFirstLesson();
        break;
      case 'not_logged_in':
        // This shouldn't happen as we check before calling, but handle defensively
        router.push(getLoginNavigationUrl(getCourseNavigationUrl(slug)));
        break;
      case 'error':
        toast(t('common:error.general'), { status: ToastStatus.Error });
        break;
      default:
        break;
    }
  };

  const onStartHereClicked = async (): Promise<void> => {
    const userLoggedIn = isLoggedIn();

    logButtonClick('course_enroll', {
      courseId: id,
      isCTA,
      userType: getUserType(userLoggedIn),
    });

    if (!userLoggedIn) {
      if (allowGuestAccess && lessons?.length > 0) {
        router.push(getLessonNavigationUrl(slug, lessons[0].slug));
      } else {
        router.push(getLoginNavigationUrl(getCourseNavigationUrl(slug)));
      }
      return;
    }

    await handleEnrollAndNavigate();
  };

  const startButton = (
    <Button isDisabled={isEnrolling} isLoading={isEnrolling} onClick={onStartHereClicked}>
      {t('start-here')}
    </Button>
  );

  if (isCTA) {
    return isUserEnrolled ? null : startButton;
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

  if (isUserEnrolled) {
    return <StartOrContinueLearning course={course} />;
  }

  return startButton;
};

export default StatusHeader;
