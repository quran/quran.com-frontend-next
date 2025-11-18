import React, { useEffect, useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';

import LessonView from '@/components/Course/LessonView';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import useEnrollUser from '@/hooks/auth/useEnrollUser';
import { Lesson } from '@/types/auth/Course';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import { getCanonicalUrl, getLessonNavigationUrl } from '@/utils/navigation';

interface Props {
  lesson: Lesson;
  lessonSlugOrId: string;
  courseSlug: string;
}

const LessonContent: React.FC<Props> = ({ lesson, lessonSlugOrId, courseSlug }) => {
  const { lang } = useTranslation('learn');
  const enrollUserInCourse = useEnrollUser();
  const enrollmentAttemptedRef = useRef(false);

  // Auto-enroll logged-in users when they view a lesson
  useEffect(() => {
    if (!lesson.course.isUserEnrolled && !enrollmentAttemptedRef.current) {
      enrollmentAttemptedRef.current = true;
      enrollUserInCourse(lesson.course.id, EnrollmentMethod.Automatic);
    }
  }, [lesson.course.id, lesson.course.isUserEnrolled, enrollUserInCourse]);

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
