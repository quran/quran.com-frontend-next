/* eslint-disable react-func/max-lines-per-function */
import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './ActionButtons.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutateMultipleKeys from '@/hooks/useMutateMultipleKeys';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import TickIcon from '@/icons/tick.svg';
import { ActivityDayType } from '@/types/auth/ActivityDay';
import { Course, Lesson } from '@/types/auth/Course';
import { updateActivityDay } from '@/utils/auth/api';
import { makeGetCourseUrl, makeGetLessonUrlPrefix } from '@/utils/auth/apiPaths';
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

  const mutateLessonAsCompleted = (lessons: Lesson[], lessonId: string) => {
    const newLessons = [...lessons];
    const lessonIndex = newLessons.findIndex((loopLesson) => loopLesson.id === lessonId);
    // safety check: if the lesson was found in the lessons array, set it as completed
    if (lessonIndex !== -1) {
      newLessons[lessonIndex].isCompleted = true;
    }
    return newLessons;
  };

  const markLessonAsCompleted = (lessonId: string, successCallback?: () => void) => {
    setIsLoading(true);
    updateActivityDay({ type: ActivityDayType.LESSON, lessonId })
      .then(() => {
        // we need to update all the cached lessons of the course to set the current lesson as completed
        mutateMultipleKeys(`${makeGetLessonUrlPrefix(courseSlug)}/.+`, (currentLesson: Lesson) => {
          const newCurrentLesson = { ...currentLesson, isCompleted: true };
          if (currentLesson?.course?.lessons) {
            newCurrentLesson.course.lessons = mutateLessonAsCompleted(
              newCurrentLesson.course.lessons,
              lessonId,
            );
          }
          return newCurrentLesson;
        });

        // update local cache of the course to set the current lesson as completed in the lessons array
        mutateWithoutRevalidation(makeGetCourseUrl(courseSlug), (currentCourse: Course) => {
          if (currentCourse) {
            const newCurrentCourse = { ...currentCourse };
            if (newCurrentCourse.lessons) {
              const completedLessons = newCurrentCourse.lessons.filter(
                (loopLesson) => loopLesson.isCompleted,
              );
              // if we are marking the last un-completed lesson in the course, we should mark the course itself as completed
              if (completedLessons.length + 1 === newCurrentCourse.lessons.length) {
                newCurrentCourse.isCompleted = true;
              }
              newCurrentCourse.lessons = mutateLessonAsCompleted(
                newCurrentCourse.lessons,
                lessonId,
              );
            }
            return newCurrentCourse;
          }
          return currentCourse;
        });

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
