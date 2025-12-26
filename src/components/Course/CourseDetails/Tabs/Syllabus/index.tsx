/* eslint-disable react/no-array-index-key */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Syllabus.module.scss';

import CompletedTick from '@/components/Course/CompletedTick';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { Course } from '@/types/auth/Course';
import { getUserType } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getLessonNavigationUrl } from '@/utils/navigation';

type Props = {
  course: Course;
};

const Syllabus: React.FC<Props> = ({ course }) => {
  const { lessons = [], slug: courseSlug, id: courseId } = course;
  const { t, lang } = useTranslation('learn');

  const userType = getUserType();

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

  return (
    <div className={styles.syllabusContainer}>
      {lessons.map((lesson, index) => {
        const dayNumber = index + 1;
        const { title, isCompleted, id, slug } = lesson;
        const url = getLessonNavigationUrl(courseSlug, slug);

        return (
          <p className={styles.container} key={index} data-testid={`syllabus-lesson-${dayNumber}`}>
            <span className={styles.day}>{`${t('day')} ${toLocalizedNumber(
              dayNumber,
              lang,
            )}`}</span>
            <span>
              {`: `}
              <Link
                onClick={() => logSyllabusClick(dayNumber, id)}
                href={url}
                variant={LinkVariant.Highlight}
              >
                {title}
              </Link>
              {isCompleted ? <CompletedTick /> : null}
            </span>
          </p>
        );
      })}
    </div>
  );
};

export default Syllabus;
