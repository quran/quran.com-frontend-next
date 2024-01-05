import React from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './ActionButtons.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import TickIcon from '@/icons/tick.svg';
import { Lesson } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';
import { getLessonNavigationUrl } from '@/utils/navigation';

type Props = {
  markLessonAsCompleted: (lessonId: string, successCallback?: () => void) => void;
  isLoading: boolean;
  lesson: Lesson;
};

const ActionButtons: React.FC<Props> = ({ isLoading, markLessonAsCompleted, lesson }) => {
  const { day, id, isFirst, isLast, course, isCompleted } = lesson;
  const router = useRouter();
  const { t } = useTranslation('learn');
  const toast = useToast();

  const navigateToLesson = (courseSlug: string, lessonSlug: string) => {
    router.push(getLessonNavigationUrl(courseSlug, lessonSlug));
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
    <div
      className={classNames(styles.buttonsContainer, {
        [styles.singleButton]: isCompleted && isFirst,
      })}
    >
      {!isFirst && (
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          prefix={<ChevronLeftIcon />}
          type={ButtonType.Secondary}
          onClick={onPreviousLessonClicked}
        >
          {t('prev-lesson')}
        </Button>
      )}
      {!isCompleted && (
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          prefix={<TickIcon />}
          onClick={onMarkAsCompletedClicked}
        >
          {t('mark-complete')}
        </Button>
      )}
      {!isLast && (
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          prefix={<ChevronRightIcon />}
          type={ButtonType.Secondary}
          onClick={onNextLessonClicked}
        >
          {t('next-lesson')}
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
