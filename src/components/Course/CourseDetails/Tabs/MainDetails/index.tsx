/* eslint-disable unicorn/no-array-reduce */
import React from 'react';

import { MilkdownProvider } from '@milkdown/react';
import useTranslation from 'next-translate/useTranslation';

import DetailSection from './DetailSection';
import AuthorDetail from './DetailSection/AuthorDetail';

import MarkdownEditor from '@/components/MarkdownEditor';
import { Course } from '@/types/auth/Course';

type Props = {
  course: Course;
};

const MainDetails: React.FC<Props> = ({ course }) => {
  const { t } = useTranslation('learn');
  const { description, dailyMinutes, lessons = [], author } = course;

  // const tagsString = tags?.reduce((acc, currentValue) => {
  //   if (!acc) return currentValue;
  //   return `${acc}, ${currentValue}`;
  // }, '');

  return (
    <>
      <DetailSection
        title={t('duration')}
        description={t('duration-daily', {
          dailyMins: dailyMinutes,
          days: lessons.length,
        })}
      />
      <MilkdownProvider>
        <DetailSection
          title={t('description')}
          description={<MarkdownEditor isEditable={false} defaultValue={description} />}
        />
      </MilkdownProvider>
      <DetailSection title={t('about-author')} description={<AuthorDetail author={author} />} />
    </>
  );
};

export default MainDetails;
