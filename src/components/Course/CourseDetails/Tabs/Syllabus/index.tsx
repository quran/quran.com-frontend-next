/* eslint-disable react/no-array-index-key */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Syllabus.module.scss';

import { Course } from '@/types/auth/Course';

type Props = {
  course: Course;
};

const Syllabus: React.FC<Props> = ({ course }) => {
  const { days } = course;
  const { t } = useTranslation('learn');

  return days.map((day, index) => {
    const dayNumber = index + 1;
    return (
      <p className={styles.container} key={index}>
        <span className={styles.day}>{`${t('day')} ${dayNumber}`}</span>: {day.title}
      </p>
    );
  });
};

export default Syllabus;
