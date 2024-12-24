/* eslint-disable react/no-array-index-key */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Syllabus.module.scss';

import CompletedTick from '@/components/Course/CompletedTick';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { Course } from '@/types/auth/Course';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getLessonNavigationUrl, getLoginNavigationUrl } from '@/utils/navigation';

type Props = {
  course: Course;
};

const Syllabus: React.FC<Props> = ({ course }) => {
  const { lessons = [], slug: courseSlug } = course;
  const { t, lang } = useTranslation('learn');

  const isUserLoggedIn = isLoggedIn();

  const onDayClick = (dayNumber: number, lessonId: string) => {
    logButtonClick(isUserLoggedIn ? 'course_syllabus_day' : 'guest_course_syllabus_day', {
      courseId: course.id,
      dayNumber,
      lessonId,
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
              <Link
                onClick={() => onDayClick(dayNumber, id)}
                href={isUserLoggedIn ? url : getLoginNavigationUrl(url)}
                variant={LinkVariant.Highlight}
              >
                {title}
              </Link>
              {isCompleted ? <CompletedTick /> : ''}
            </span>
          </p>
        );
      })}
    </div>
  );
};

export default Syllabus;
