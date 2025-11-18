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
  const router = useRouter();

  // Navigate to the lesson user should continue from, or first lesson if not set
  const redirectToLessonSlug = continueFromLesson || lessons?.[0]?.slug;

  const onContinueLearningClicked = () => {
    logButtonClick('continue_learning', {
      courseId: id,
      isHeaderButton,
      userType,
    });
    router.push(getLessonNavigationUrl(slug, redirectToLessonSlug));
  };

  return <Button onClick={onContinueLearningClicked}>{t('continue-learning')}</Button>;
};

export default StartOrContinueLearning;
