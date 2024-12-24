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
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import { Course } from '@/types/auth/Course';
import { enrollUser } from '@/utils/auth/api';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
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
  const { title, id, isUserEnrolled, slug, isCompleted, lessons } = course;
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { t } = useTranslation('learn');
  const mutate = useMutateWithoutRevalidation();

  const onEnrollClicked = () => {
    if (isLoggedIn()) {
      logButtonClick('user_enroll_course', { courseId: id, isCTA });
      setIsLoading(true);
      enrollUser(course.id)
        .then(() => {
          toast(
            t('enroll-success', {
              title,
            }),
            {
              status: ToastStatus.Success,
            },
          );
          mutate(makeGetCourseUrl(slug), (currentCourse: Course) => {
            return {
              ...currentCourse,
              isUserEnrolled: true,
            };
          });
          // if the course has lessons, redirect to the first lesson
          if (lessons?.length > 0) {
            router.replace(getLessonNavigationUrl(slug, lessons[0].slug));
          }
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
      logButtonClick('guest_enroll_course', { courseId: id, isCTA });
      router.replace(getLoginNavigationUrl(getCourseNavigationUrl(slug)));
    }
  };

  if (isCTA) {
    if (isUserEnrolled === true) {
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
  if (isUserEnrolled === true) {
    return <StartOrContinueLearning course={course} />;
  }

  return (
    <Button isDisabled={isLoading} isLoading={isLoading} onClick={onEnrollClicked}>
      {t('enroll')}
    </Button>
  );
};

export default StatusHeader;
