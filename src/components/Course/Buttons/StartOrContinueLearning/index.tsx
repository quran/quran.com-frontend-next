import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import Button from '@/dls/Button/Button';
import { Course } from '@/types/auth/Course';
import { getUserType } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLessonNavigationUrl } from '@/utils/navigation';

type Props = {
  course: Course;
  isHeaderButton?: boolean;
};

const StartOrContinueLearning: React.FC<Props> = ({ course, isHeaderButton = true }) => {
  const { t } = useTranslation('learn');
  const { lessons, continueFromLesson, id, slug } = course;
  const userType = getUserType();
  /**
   * there is a corner case when the user enrolls,
   * goes back to main page then clicks start learning again,
   * continueFromLesson is undefined since it has been cached from
   * before the user enrolled.
   */
  const redirectToLessonSlug = continueFromLesson || lessons?.[0]?.slug;
  const router = useRouter();
  const userCompletedAnyLesson = lessons.some((lesson) => lesson.isCompleted);
  const onContinueLearningClicked = () => {
    logButtonClick('continue_learning', {
      courseId: id,
      isHeaderButton,
      userType,
    });
    router.push(getLessonNavigationUrl(slug, redirectToLessonSlug));
  };

  const onStartLearningClicked = () => {
    logButtonClick('start_learning', {
      courseId: id,
      isHeaderButton,
      userType,
    });
    router.push(getLessonNavigationUrl(slug, redirectToLessonSlug));
  };

  if (userCompletedAnyLesson) {
    return <Button onClick={onContinueLearningClicked}>{t('continue-learning')}</Button>;
  }
  return <Button onClick={onStartLearningClicked}>{t('start-learning')}</Button>;
};

export default StartOrContinueLearning;
