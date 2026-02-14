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
  const description = `Lesson ${lesson.day} of "${lesson.course.title}"`;

  return (
    <>
      <NextSeoWrapper
        title={lesson.title}
        description={description}
        url={getCanonicalUrl(lang, getLessonNavigationUrl(courseSlug, lessonSlugOrId))}
        image={lesson.course.thumbnail}
        imageWidth={1200}
        imageHeight={1000}
      />
      <LessonView lesson={lesson} lessonSlugOrId={lessonSlugOrId} courseSlug={courseSlug} />
    </>
  );
};

export default LessonContent;
