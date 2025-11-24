import { useCallback } from 'react';

import { NextPage } from 'next';
import { useRouter } from 'next/router';

import LessonContent from '@/components/Course/LessonContent';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import useEnrollUser from '@/hooks/auth/useEnrollUser';
import layoutStyles from '@/pages/index.module.scss';
import { Lesson } from '@/types/auth/Course';
import EnrollmentMethod from '@/types/auth/EnrollmentMethod';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetLessonUrl } from '@/utils/auth/apiPaths';

interface Props {
  hasError?: boolean;
  page?: any[];
}

const LessonPage: NextPage<Props> = () => {
  const router = useRouter();
  const { slug, lessonSlugOrId } = router.query;
  const enrollUserInCourse = useEnrollUser();

  const handleFetchSuccess: (data: any) => void = useCallback(
    (lesson: Lesson) => {
      if (lesson?.course && !lesson.course.isUserEnrolled) {
        enrollUserInCourse(lesson.course.id, EnrollmentMethod.Automatic);
      }
    },
    [enrollUserInCourse],
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
        render={bodyRenderer}
        onFetchSuccess={handleFetchSuccess}
      />
    </div>
  );
};

export default LessonPage;
