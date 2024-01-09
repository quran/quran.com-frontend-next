import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './ActionButtons.module.scss';
import { mutateCachedCourse, mutateCachedLessons } from './mutations';

import Button, { ButtonSize } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutateMultipleKeys from '@/hooks/useMutateMultipleKeys';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import TickIcon from '@/icons/tick.svg';
import { ActivityDayType } from '@/types/auth/ActivityDay';
import { Lesson } from '@/types/auth/Course';
import { updateActivityDay } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';
import { getLessonNavigationUrl } from '@/utils/navigation';

type Props = {
  lesson: Lesson;
  courseSlug: string;
};

const ActionButtons: React.FC<Props> = ({ lesson, courseSlug }) => {
  const { day, id, isFirst, isLast, course, isCompleted } = lesson;
  const router = useRouter();
  const { t } = useTranslation('learn');
  const mutateWithoutRevalidation = useMutateWithoutRevalidation();
  const mutateMultipleKeys = useMutateMultipleKeys();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const markLessonAsCompleted = (lessonId: string, successCallback?: () => void) => {
    setIsLoading(true);
    updateActivityDay({ type: ActivityDayType.LESSON, lessonId })
      .then(() => {
        mutateCachedLessons(mutateMultipleKeys, courseSlug, lessonId);
        mutateCachedCourse(mutateWithoutRevalidation, courseSlug, lessonId);
        if (successCallback) {
          successCallback();
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
  };

  const navigateToLesson = (navigateToCourseSlug: string, navigateToLessonSlug: string) => {
    router.push(getLessonNavigationUrl(navigateToCourseSlug, navigateToLessonSlug));
  };

  const onPreviousLessonClicked = () => {
    logButtonClick('previous_lesson', {
      lessonId: id,
      isCompleted,
    });
    const lessonIndex = day - 1;
    const previousLessonSlug = course.lessons[lessonIndex - 1].slug;
    navigateToLesson(course.slug, previousLessonSlug);
  };

  const onMarkAsCompletedClicked = () => {
    logButtonClick('mark_lesson_as_completed', {
      lessonId: id,
    });
    markLessonAsCompleted(id, () => {
      toast(t('mark-complete-success'), {
        status: ToastStatus.Success,
      });
    });
  };

  const onNextLessonClicked = () => {
    logButtonClick('next_lesson', {
      lessonId: id,
      isCompleted,
    });
    const lessonIndex = day - 1;
    const nextLessonSlug = course.lessons[lessonIndex + 1].slug;
    navigateToLesson(course.slug, nextLessonSlug);
  };
  return (
    <div className={styles.buttonsContainer}>
      {!isFirst && (
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          size={ButtonSize.Small}
          // prefix={<ChevronLeftIcon />}
          onClick={onPreviousLessonClicked}
        >
          <ChevronLeftIcon />
        </Button>
      )}
      {!isCompleted && (
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          prefix={<TickIcon />}
          size={ButtonSize.Small}
          onClick={onMarkAsCompletedClicked}
        >
          {t('mark-complete')}
        </Button>
      )}
      {!isLast && (
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          size={ButtonSize.Small}
          onClick={onNextLessonClicked}
        >
          <ChevronRightIcon />
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
