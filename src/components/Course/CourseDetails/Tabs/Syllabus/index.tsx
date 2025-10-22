/* eslint-disable react/no-array-index-key */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Syllabus.module.scss';

import CompletedTick from '@/components/Course/CompletedTick';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { Course } from '@/types/auth/Course';
import { getUserType, isUserOrGuestEnrolled } from '@/utils/auth/guestCourseEnrollment';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getLessonNavigationUrl } from '@/utils/navigation';

type Props = {
  course: Course;
};

const Syllabus: React.FC<Props> = ({ course }) => {
  const { lessons = [], slug: courseSlug, id: courseId, isUserEnrolled } = course;
  const { t, lang } = useTranslation('learn');
  const toast = useToast();

  const userType = getUserType();
  const eventName = `${userType === 'logged_in' ? '' : 'guest_'}course_syllabus_day`;

  /**
   * Handle lesson click from syllabus for enrolled users
   * Logs the click event for analytics
   * @param {number} dayNumber - The day number of the lesson
   * @param {string} lessonId - The ID of the lesson
   */
  const onEnrolledDayClick = (dayNumber: number, lessonId: string) => {
    logButtonClick(eventName, {
      courseId,
      dayNumber,
      lessonId,
      userType,
    });
  };

  /**
   * Handle lesson click for non-enrolled users
   * Shows a toast message explaining enrollment is required
   * @param {number} dayNumber - The day number of the lesson
   * @param {string} lessonId - The ID of the lesson
   */
  const onNonEnrolledDayClick = (dayNumber: number, lessonId: string) => {
    logButtonClick(eventName, {
      courseId,
      dayNumber,
      lessonId,
      userType,
    });

    const message = t('not-enrolled').replace(/<\/?link>/g, '');
    toast(message, {
      status: ToastStatus.Warning,
    });
  };

  return (
    <div className={styles.syllabusContainer}>
      {lessons.map((lesson, index) => {
        const dayNumber = index + 1;
        const { title, isCompleted, id, slug } = lesson;
        const url = getLessonNavigationUrl(courseSlug, slug);

        // Check if user/guest is enrolled
        const isEnrolled = isUserOrGuestEnrolled(courseId, isUserEnrolled);

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
                  onClick={() => onEnrolledDayClick(dayNumber, id)}
                  href={url}
                  variant={LinkVariant.Highlight}
                >
                  {title}
                </Link>
              ) : (
                <button
                  type="button"
                  className={styles.disabledLink}
                  onClick={() => onNonEnrolledDayClick(dayNumber, id)}
                >
                  {title}
                </button>
              )}
              {isCompleted ? <CompletedTick /> : ''}
            </span>
          </p>
        );
      })}
    </div>
  );
};

export default Syllabus;
