import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './ActionButtons.module.scss';
import CompleteButton from './CompleteButton';
import { mutateCachedCourse, mutateCachedLessons } from './mutations';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutateMultipleKeys from '@/hooks/useMutateMultipleKeys';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
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

  const onNextLessonClicked = () => {
    logButtonClick('next_lesson', {
      lessonId: id,
      isCompleted,
    });
    const lessonIndex = day - 1;
    const nextLessonSlug = course.lessons[lessonIndex + 1].slug;
    navigateToLesson(course.slug, nextLessonSlug);
  };

  const onAddReflectionClick = () => {
    logButtonClick('add_lesson_reflection', {
      lessonId: id,
      isCompleted,
    });
  };

  return (
    <>
      <div className={styles.buttonsContainer}>
        {!isFirst && (
          <Button
            isLoading={isLoading}
            isDisabled={isLoading}
            size={ButtonSize.Small}
            onClick={onPreviousLessonClicked}
          >
            <ChevronLeftIcon />
          </Button>
        )}
        {!isCompleted && (
          <CompleteButton
            id={id}
            isLoading={isLoading}
            markLessonAsCompleted={markLessonAsCompleted}
          />
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
      <div className={styles.addReflectionButton}>
        <Button
          size={ButtonSize.Small}
          onClick={onAddReflectionClick}
          href="https://quranreflect.com"
          isNewTab
          type={ButtonType.Secondary}
        >
          {t('add-reflection')}
        </Button>
      </div>
    </>
  );
};

export default ActionButtons;
