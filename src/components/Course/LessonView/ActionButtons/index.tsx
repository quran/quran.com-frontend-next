import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './ActionButtons.module.scss';
import CompleteButton from './CompleteButton';

import CourseFeedback, { FeedbackSource } from '@/components/Course/CourseFeedback';
import {
  mutateCachedCourseAfterCompletion,
  mutateCachedLessonsAfterCompletion,
} from '@/components/Course/utils/mutations';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutateMultipleKeys from '@/hooks/useMutateMultipleKeys';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import useScrollToTop from '@/hooks/useScrollToTop';
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
  const scrollToTop = useScrollToTop();
  const { day, id, isFirst, isLast, course, isCompleted } = lesson;
  const router = useRouter();
  const { t } = useTranslation('learn');
  const mutateWithoutRevalidation = useMutateWithoutRevalidation();
  const mutateMultipleKeys = useMutateMultipleKeys();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [shouldOpenFeedbackModal, setShouldOpenFeedbackModal] = useState(false);

  const markLessonAsCompleted = (lessonId: string, successCallback?: () => void) => {
    setIsLoading(true);
    updateActivityDay({ type: ActivityDayType.LESSON, lessonId })
      .then(() => {
        mutateCachedLessonsAfterCompletion(mutateMultipleKeys, courseSlug, lessonId);
        mutateCachedCourseAfterCompletion(mutateWithoutRevalidation, courseSlug, lessonId);
        if (successCallback) {
          successCallback();
        }
        // check if the last lesson of the course is completed, and ask user for feedback
        const completedLessonsCount = course.lessons.filter(
          (filterLesson) => filterLesson.isCompleted,
        ).length;
        const isLastCompletedLessonOfCourse = completedLessonsCount === course.lessons.length;
        if (isLastCompletedLessonOfCourse) {
          setShouldOpenFeedbackModal(true);
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
    scrollToTop();
    navigateToLesson(course.slug, previousLessonSlug);
  };

  const onNextLessonClicked = () => {
    logButtonClick('next_lesson', {
      lessonId: id,
      isCompleted,
    });
    const lessonIndex = day - 1;
    const nextLessonSlug = course.lessons[lessonIndex + 1].slug;
    scrollToTop();
    navigateToLesson(course.slug, nextLessonSlug);
  };

  const onAddReflectionClick = () => {
    logButtonClick('add_lesson_reflection', {
      lessonId: id,
      isCompleted,
    });
  };

  const shouldShowAddFeedbackButton =
    course?.userHasFeedback === false &&
    (course?.isCompleted === true || shouldOpenFeedbackModal === true);

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
          type={ButtonType.Success}
        >
          {t('add-reflection')}
        </Button>
        {shouldShowAddFeedbackButton && (
          <CourseFeedback
            shouldOpenModal={shouldOpenFeedbackModal}
            course={course}
            source={FeedbackSource.LessonPage}
          />
        )}
      </div>
    </>
  );
};

export default ActionButtons;
