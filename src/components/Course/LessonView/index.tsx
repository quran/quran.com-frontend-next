/* eslint-disable react-func/max-lines-per-function */
import React, { useCallback, useState } from 'react';

import { MilkdownProvider } from '@milkdown/react';
import useTranslation from 'next-translate/useTranslation';

import ActionButtons from './ActionButtons';
import styles from './Lesson.module.scss';

import MarkdownEditor from '@/components/MarkdownEditor';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import ArrowLeft from '@/icons/west.svg';
import { ActivityDayType } from '@/types/auth/ActivityDay';
import { Course, Lesson } from '@/types/auth/Course';
import { updateActivityDay } from '@/utils/auth/api';
import { makeGetCourseUrl, makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getCourseNavigationUrl } from '@/utils/navigation';

type Props = {
  lesson: Lesson;
  courseSlug: string;
  lessonSlugOrId: string;
};

const LessonView: React.FC<Props> = ({ lesson, courseSlug, lessonSlugOrId }) => {
  const { title, content, day } = lesson;
  const { t, lang } = useTranslation('learn');
  const mutate = useMutateWithoutRevalidation();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const markLessonAsCompleted = useCallback(
    (lessonId: string, successCallback?: () => void) => {
      setIsLoading(true);
      updateActivityDay({ type: ActivityDayType.LESSON, lessonId })
        .then(() => {
          // update local cache of the lesson to completed
          mutate(makeGetLessonUrl(courseSlug, lessonSlugOrId), (currentLesson: Lesson) => {
            return {
              ...currentLesson,
              isCompleted: true,
            };
          });
          // update local cache of the course to set the current lesson as completed in the lessons array
          mutate(makeGetCourseUrl(courseSlug, { withLessons: true }), (currentCourse: Course) => {
            // if lessons exist
            if (currentCourse?.lessons) {
              // TODO: handle case when the current lesson is the last un-completed lesson of the course, we should also set the course isCompleted to true
              const newCurrentCourse = { ...currentCourse };
              const lessonIndex = newCurrentCourse.lessons.findIndex(
                (loopLesson) => loopLesson.id === lessonId,
              );
              if (lessonIndex !== -1) {
                newCurrentCourse.lessons[lessonIndex].isCompleted = true;
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
    },
    [courseSlug, lessonSlugOrId, mutate, t, toast],
  );

  const onBackButtonClicked = () => {
    logButtonClick('back_to_course', { lessonSlugOrId, courseSlug });
  };

  return (
    <>
      <Button
        onClick={onBackButtonClicked}
        href={getCourseNavigationUrl(courseSlug)}
        variant={ButtonVariant.Ghost}
      >
        <ArrowLeft />
        <p className={styles.backText}>{t('back-to-course')}</p>
      </Button>
      <div className={styles.headerContainer}>
        <p className={styles.title}>
          {`${t('day')} ${toLocalizedNumber(day, lang)}`}
          {`: ${title}`}
        </p>
      </div>
      <div className={styles.contentContainer}>
        <MilkdownProvider>
          <MarkdownEditor isEditable={false} defaultValue={content} />
        </MilkdownProvider>
      </div>
      <ActionButtons
        lesson={lesson}
        isLoading={isLoading}
        markLessonAsCompleted={markLessonAsCompleted}
      />
    </>
  );
};

export default LessonView;
