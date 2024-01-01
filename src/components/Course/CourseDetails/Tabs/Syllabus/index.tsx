/* eslint-disable react/no-array-index-key */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Syllabus.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import { Course } from '@/types/auth/Course';
import { toLocalizedNumber } from '@/utils/locale';
import { getLessonNavigationUrl } from '@/utils/navigation';

type Props = {
  course: Course;
};

const Syllabus: React.FC<Props> = ({ course }) => {
  const { lessons = [] } = course;
  const { t, lang } = useTranslation('learn');

  const onDayClick = (dayNumber: number, lessonId: string) => {};

  return (
    <>
      {lessons.map((lesson, index) => {
        const dayNumber = index + 1;

        return (
          <p className={styles.container} key={index}>
            <span className={styles.day}>{`${t('day')} ${toLocalizedNumber(
              dayNumber,
              lang,
            )}`}</span>
            <span>
              {`: `}
              <Link
                onClick={() => onDayClick(dayNumber, lesson.id)}
                href={getLessonNavigationUrl(course.slug, lesson.slug)}
                variant={LinkVariant.Highlight}
              >
                {lesson.title}
              </Link>
            </span>
          </p>
        );
      })}
    </>
  );
};

export default Syllabus;
