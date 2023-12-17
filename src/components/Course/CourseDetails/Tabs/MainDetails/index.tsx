/* eslint-disable unicorn/no-array-reduce */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import DetailSection from './DetailSection';

import { Course } from '@/types/auth/Course';

type Props = {
  course: Course;
};

const MainDetails: React.FC<Props> = ({ course }) => {
  const { t } = useTranslation('learn');
  const { description, tags, author, dailyMins, days } = course;

  const tagsString = tags?.reduce((acc, currentValue) => {
    return `${acc}, ${currentValue}`;
  }, '');

  return (
    <>
      <DetailSection title={t('author')} description={author} />
      <DetailSection
        title={t('duration')}
        description={t('duration-daily', {
          dailyMins,
          days: days.length,
        })}
      />
      <DetailSection title={t('description')} description={description} />
      {tagsString && <DetailSection title={t('category')} description={tagsString} />}
    </>
  );
};

export default MainDetails;
