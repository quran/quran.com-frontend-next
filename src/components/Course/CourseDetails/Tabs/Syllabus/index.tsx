/* eslint-disable react/no-array-index-key */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Syllabus.module.scss';

import CompletedTick from '@/components/Course/CompletedTick';
import Button from '@/components/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { useIsEnrolled } from '@/hooks/auth/useGuestEnrollment';
import { Course } from '@/types/auth/Course';
import { getUserType } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getLessonNavigationUrl } from '@/utils/navigation';
import { stripHTMLTags } from '@/utils/string';

type Props = {
  course: Course;
};

const Syllabus: React.FC<Props> = ({ course }) => {
  const { lessons = [], slug: courseSlug, id: courseId, isUserEnrolled } = course;
  const { t, lang } = useTranslation('learn');
  const toast = useToast();

  const userType = getUserType();
  const isEnrolled = useIsEnrolled(courseId, isUserEnrolled);

  /**
   * Log syllabus lesson click for analytics
   * @param {number} dayNumber - The day number of the lesson
   * @param {string} lessonId - The ID of the lesson
   */
  const logSyllabusClick = (dayNumber: number, lessonId: string) => {
    logButtonClick('course_syllabus_day', {
      courseId,
      dayNumber,
      lessonId,
      userType,
    });
  };

  /**
   * Handle lesson click for non-enrolled users, shows toast message
   * @param {number} dayNumber - The day number of the lesson
   * @param {string} lessonId - The ID of the lesson
   */
  const onNonEnrolledDayClick = (dayNumber: number, lessonId: string) => {
    logSyllabusClick(dayNumber, lessonId);
    toast(stripHTMLTags(t('not-enrolled')), {
      status: ToastStatus.Warning,
    });
  };

  return (
    <div className={styles.syllabusContainer}>
      {lessons.map((lesson, index) => {
        const dayNumber = index + 1;
        const { title, isCompleted, id, slug } = lesson;
        const url = getLessonNavigationUrl(courseSlug, slug);

        return (
          <p className={styles.container} key={index}>
            <span className={styles.day}>{`${t('day')} ${toLocalizedNumber(
              dayNumber,
              lang,
            )}`}</span>
            <span>
              {`: `}
              {isEnrolled ? (
                <Link
                  onClick={() => logSyllabusClick(dayNumber, id)}
                  href={url}
                  variant={LinkVariant.Highlight}
                >
                  {title}
                </Link>
              ) : (
                <Button
                  htmlType="button"
                  className={styles.notEnrolledLink}
                  onClick={() => onNonEnrolledDayClick(dayNumber, id)}
                  ariaLabel={title}
                >
                  {title}
                </Button>
              )}
              {isCompleted ? <CompletedTick /> : null}
            </span>
          </p>
        );
      })}
    </div>
  );
};

export default Syllabus;
