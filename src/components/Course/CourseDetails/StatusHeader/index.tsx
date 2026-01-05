/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import StartOrContinueLearning from '@/components/Course/Buttons/StartOrContinueLearning';
import CompletedStatus from '@/components/Course/CompletedStatus';
import Button from '@/dls/Button/Button';
import { useToast, ToastStatus } from '@/dls/Toast/Toast';
import { Course } from '@/types/auth/Course';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import { getUserType, isLoggedIn } from '@/utils/auth/login';
import useCourseEnrollment from '@/utils/auth/useCourseEnrollment';
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
  const router = useRouter();
  const { t } = useTranslation('learn');
  const toast = useToast();
  const userLoggedIn = isLoggedIn();
  const { enroll, isEnrolling } = useCourseEnrollment(slug);

  const redirectToFirstLesson = () => {
    if (lessons?.length > 0) {
      router.replace(getLessonNavigationUrl(slug, lessons[0].slug));
    }
  };

  const handleUnauthenticatedUser = () => {
    if (allowGuestAccess) {
      redirectToFirstLesson();
      return;
    }
    const redirectUrl = getCourseNavigationUrl(slug);
    router.replace(getLoginNavigationUrl(redirectUrl));
  };

  const onStartHereClicked = async (): Promise<void> => {
    const userType = getUserType(userLoggedIn);

    logButtonClick('course_enroll', {
      courseId: id,
      isCTA,
      userType,
    });

    if (!userLoggedIn) {
      handleUnauthenticatedUser();
      return;
    }

    const enrollmentResult = await enroll(id, EnrollmentMethod.MANUAL);
    if (enrollmentResult.success) {
      redirectToFirstLesson();
    } else {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    }
  };

  const renderStartHereButton = () => {
    return (
      <Button isDisabled={isEnrolling} isLoading={isEnrolling} onClick={onStartHereClicked}>
        {t('start-here')}
      </Button>
    );
  };
  if (isCTA) {
    if (isUserEnrolled) {
      return <></>;
    }
    return renderStartHereButton();
  }
  if (isCompleted) {
    return <CompletedStatus course={course} />;
  }
  if (isUserEnrolled) {
    return <StartOrContinueLearning course={course} />;
  }

  return renderStartHereButton();
};

export default StatusHeader;
