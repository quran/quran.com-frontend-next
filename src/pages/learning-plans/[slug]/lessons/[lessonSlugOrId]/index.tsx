import { NextPage } from 'next';
import { useRouter } from 'next/router';

import LessonContent from '@/components/Course/LessonContent';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import layoutStyles from '@/pages/index.module.scss';
import ApiErrorMessage from '@/types/ApiErrorMessage';
import { BaseResponse } from '@/types/ApiResponses';
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
  const { enroll } = useCourseEnrollment(slug as string);

  const handleFetchSuccess = useCallback(
    (data: BaseResponse) => {
      const lesson = data as Lesson;
      if (!lesson?.course || lesson.course.isUserEnrolled) {
        return;
      }
      enroll(lesson.course.id, EnrollmentMethod.AUTOMATIC);
    },
    [enroll],
  );

  const renderError = (error: any) => {
    if (error?.message === ApiErrorMessage.CourseNotEnrolled) {
      router.replace(getLoginNavigationUrl(getCourseNavigationUrl(slug as string)));
    }
    return <></>;
  };

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
