import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CompletedStatus.module.scss';

import CourseFeedback, { FeedbackSource } from '@/components/Course/CourseFeedback';
import Pill from '@/dls/Pill';
import { Course } from '@/types/auth/Course';

type Props = {
  course: Course;
};

const CompletedStatus: React.FC<Props> = ({ course }) => {
  const { t } = useTranslation('learn');

  return (
    <div className={styles.container}>
      <Pill>{t('completed')}</Pill>
      {course?.userHasFeedback === false && (
        <CourseFeedback course={course} source={FeedbackSource.CoursePage} />
      )}
    </div>
  );
};

export default CompletedStatus;
