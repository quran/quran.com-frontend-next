import { useCallback } from 'react';

import { NextPage } from 'next';
import { useRouter } from 'next/router';

import LessonContent from '@/components/Course/LessonContent';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import useCourseEnrollment from '@/hooks/auth/useCourseEnrollment';
import layoutStyles from '@/pages/index.module.scss';
import ApiErrorMessage from '@/types/ApiErrorMessage';
import { Lesson } from '@/types/auth/Course';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { getLessonNavigationUrl, getLoginNavigationUrl } from '@/utils/navigation';
import { BaseResponse } from 'types/ApiResponses';

const LessonPage: NextPage = () => {
  const router = useRouter();
  const { slug, lessonSlugOrId } = router.query;

  // Type guards for router query params
  const courseSlug = typeof slug === 'string' ? slug : '';
  const lessonSlug = typeof lessonSlugOrId === 'string' ? lessonSlugOrId : '';

  const { enroll } = useCourseEnrollment();

  const renderError = useCallback(
    (error: { message?: string }) => {
      if (error?.message === ApiErrorMessage.CourseNotEnrolled) {
        router.push(getLoginNavigationUrl(getLessonNavigationUrl(courseSlug, lessonSlug)));
      }
      return undefined;
    },
    [router, courseSlug, lessonSlug],
  );

  const handleFetchSuccess = useCallback(
    (data: BaseResponse) => {
      const lesson = data as Lesson;
      // Skip if no course data or user is already enrolled
      if (!lesson?.course || lesson.course.isUserEnrolled) {
        return;
      }

      // Auto-enroll silently - errors are handled internally by the hook
      // Fire-and-forget pattern for auto-enrollment
      enroll(lesson.course.id, EnrollmentMethod.AUTOMATIC, {
        silent: true,
        courseSlug: lesson.course.slug,
      }).catch(() => {
        // Errors already logged in hook, nothing to do here
      });
    },
    [enroll],
  );

  const renderLesson = useCallback(
    (data: BaseResponse) => {
      const lesson = data as Lesson;
      if (!lesson) {
        return null;
      }

      return <LessonContent lesson={lesson} lessonSlugOrId={lessonSlug} courseSlug={courseSlug} />;
    },
    [lessonSlug, courseSlug],
  );

  // Don't render DataFetcher until we have the route params
  if (!courseSlug || !lessonSlug) {
    return (
      <div className={layoutStyles.pageContainer}>
        <div className={layoutStyles.loadingContainer}>
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className={layoutStyles.pageContainer}>
      <DataFetcher
        loading={() => (
          <div className={layoutStyles.loadingContainer}>
            <Spinner />
          </div>
        )}
        queryKey={makeGetLessonUrl(courseSlug, lessonSlug)}
        fetcher={privateFetcher}
        renderError={renderError}
        render={renderLesson}
        onFetchSuccess={handleFetchSuccess}
      />
    </div>
  );
};

export default LessonPage;
