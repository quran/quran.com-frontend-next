/* eslint-disable unicorn/no-array-reduce */
import React from 'react';

import { MilkdownProvider } from '@milkdown/react';
import useTranslation from 'next-translate/useTranslation';

import DetailSection from './DetailSection';
import styles from './MainDetails.module.scss';

import MarkdownEditor from '@/components/MarkdownEditor';
import HtmlContent from '@/components/RichText/HtmlContent';
import { Course } from '@/types/auth/Course';

type Props = {
  course: Course;
};

const MainDetails: React.FC<Props> = ({ course }) => {
  const { t } = useTranslation('learn');
  const { description, dailyMinutes, lessons = [] } = course;

  // const tagsString = tags?.reduce((acc, currentValue) => {
  //   if (!acc) return currentValue;
  //   return `${acc}, ${currentValue}`;
  // }, '');

  // FIXME: remove once markdown in api is converted to html
  const shouldUseMilkdown = /(^|\n)\s*#/m.test(description ?? '') || /\\$/m.test(description ?? '');

  return (
    <>
      <DetailSection
        title={t('learn-duration')}
        description={`${t('duration-daily', {
          dailyMins: dailyMinutes,
          days: lessons.length,
        })}.`}
      />
      {shouldUseMilkdown ? (
        <MilkdownProvider>
          <DetailSection
            title={t('description')}
            description={<MarkdownEditor isEditable={false} defaultValue={description} />}
          />
        </MilkdownProvider>
      ) : (
        <DetailSection
          title={t('description')}
          description={
            <div className={styles.htmlDescription}>
              <HtmlContent html={description} />
            </div>
          }
        />
      )}
    </>
  );
};

export default MainDetails;
