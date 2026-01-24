import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import LessonView from '@/components/Course/LessonView';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { Lesson } from '@/types/auth/Course';
import { getCanonicalUrl, getLessonNavigationUrl } from '@/utils/navigation';

interface Props {
  lesson: Lesson;
  lessonSlugOrId: string;
  courseSlug: string;
}

const LessonContent: React.FC<Props> = ({ lesson, lessonSlugOrId, courseSlug }) => {
  const { lang } = useTranslation('learn');
  return (
    <>
      <NextSeoWrapper
        title={lesson.title}
        url={getCanonicalUrl(lang, getLessonNavigationUrl(courseSlug, lessonSlugOrId))}
      />
      <LessonView lesson={lesson} lessonSlugOrId={lessonSlugOrId} courseSlug={courseSlug} />
    </>
  );
};

export default LessonContent;
