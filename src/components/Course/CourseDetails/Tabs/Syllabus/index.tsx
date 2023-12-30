/* eslint-disable react/no-array-index-key */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Syllabus.module.scss';

import { Course } from '@/types/auth/Course';
import { toLocalizedNumber } from '@/utils/locale';

type Props = {
  course: Course;
};

const Syllabus: React.FC<Props> = ({ course }) => {
  const { lessons = [] } = course;
  const { t, lang } = useTranslation('learn');

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
            <span>{`: ${lesson.title}`}</span>
          </p>
        );
      })}
    </>
  );
};

export default Syllabus;
