import { useCallback } from 'react';

import { NextPage } from 'next';
import { useRouter } from 'next/router';

import LessonContent from '@/components/Course/LessonContent';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import useEnrollUser from '@/hooks/auth/useEnrollUser';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import layoutStyles from '@/pages/index.module.scss';
import ApiErrorMessage from '@/types/ApiErrorMessage';
import { Course, Lesson } from '@/types/auth/Course';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetCourseUrl, makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { getLessonNavigationUrl, getLoginNavigationUrl } from '@/utils/navigation';

interface Props {
  hasError?: boolean;
  page?: any[];
}

const LessonPage: NextPage<Props> = () => {
  const router = useRouter();
  const { slug, lessonSlugOrId } = router.query;
  const enrollUserInCourse = useEnrollUser();
  const mutate = useMutateWithoutRevalidation();

  const renderError = (error: any) => {
    if (error?.message === ApiErrorMessage.CourseNotEnrolled) {
      router.push(
        getLoginNavigationUrl(getLessonNavigationUrl(slug as string, lessonSlugOrId as string)),
      );
    }
    return undefined;
  };

  const handleFetchSuccess = useCallback(
    async (lesson: Lesson) => {
      if (!lesson?.course || lesson.course.isUserEnrolled) {
        return;
      }

      const { success } = await enrollUserInCourse(lesson.course.id, EnrollmentMethod.AUTOMATIC);

      if (success) {
        mutate(makeGetCourseUrl(slug as string), (currentCourse: Course) => ({
          ...currentCourse,
          isUserEnrolled: true,
        }));
      }
    },
    [enrollUserInCourse, mutate, slug],
  );

  const bodyRenderer = ((lesson: Lesson) => {
    if (lesson) {
      return (
        <LessonContent
          lesson={lesson}
          lessonSlugOrId={lessonSlugOrId as string}
          courseSlug={slug as string}
        />
      );
    }
    return <></>;
  }) as any;

  return (
    <div className={layoutStyles.pageContainer}>
      <DataFetcher
        loading={() => (
          <div className={layoutStyles.loadingContainer}>
            <Spinner />
          </div>
        )}
        queryKey={makeGetLessonUrl(slug as string, lessonSlugOrId as string)}
        fetcher={privateFetcher}
        renderError={renderError}
        render={bodyRenderer}
        onFetchSuccess={handleFetchSuccess}
      />
    </div>
  );
};

export default LessonPage;
