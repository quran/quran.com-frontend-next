/* eslint-disable react/no-multi-comp */
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import NotEnrolledNotice from './NotEnrolledNotice';

import LessonView from '@/components/Course/LessonView';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import Spinner from '@/dls/Spinner/Spinner';
import { useIsEnrolled } from '@/hooks/auth/useGuestEnrollment';
import layoutStyles from '@/pages/index.module.scss';
import ApiErrorMessage from '@/types/ApiErrorMessage';
import { Lesson } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { getCanonicalUrl, getLessonNavigationUrl } from '@/utils/navigation';

interface Props {
  hasError?: boolean;
  page?: any[];
}

const Loading = () => (
  <div className={layoutStyles.loadingContainer}>
    <Spinner />
  </div>
);

const LessonPage: NextPage<Props> = () => {
  const { lang } = useTranslation('learn');
  const router = useRouter();
  const { slug, lessonSlugOrId } = router.query;

  const onUnEnrolledNavigationLinkClicked = () => {
    logButtonClick('unenrolled_course_link', { courseSlugOrId: slug, lessonSlugOrId });
  };

  const renderError = (error: any) => {
    if (error?.message === ApiErrorMessage.CourseNotEnrolled) {
      return (
        <NotEnrolledNotice
          slug={slug as string}
          onNavigationLinkClick={onUnEnrolledNavigationLinkClicked}
        />
      );
    }
    return undefined;
  };

  const LessonContent: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
    const isEnrolled = useIsEnrolled(lesson.course.id, lesson.course.isUserEnrolled);

    if (isEnrolled === false) {
      return (
        <NotEnrolledNotice
          slug={slug as string}
          onNavigationLinkClick={onUnEnrolledNavigationLinkClicked}
        />
      );
    }

    return (
      <>
        <NextSeoWrapper
          title={lesson.title}
          url={getCanonicalUrl(
            lang,
            getLessonNavigationUrl(slug as string, lessonSlugOrId as string),
          )}
        />
        <LessonView
          lesson={lesson}
          lessonSlugOrId={lessonSlugOrId as string}
          courseSlug={slug as string}
        />
      </>
    );
  };

  const bodyRenderer = ((lesson: Lesson) => {
    if (lesson) {
      return <LessonContent lesson={lesson} />;
    }
    return <></>;
  }) as any;

  return (
    <div className={layoutStyles.pageContainer}>
      <DataFetcher
        loading={Loading}
        queryKey={makeGetLessonUrl(slug as string, lessonSlugOrId as string)}
        fetcher={privateFetcher}
        renderError={renderError}
        render={bodyRenderer}
      />
    </div>
  );
};

export default LessonPage;
