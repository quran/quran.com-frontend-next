/* eslint-disable react/no-multi-comp */
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './lessons.module.scss';

import LessonView from '@/components/Course/LessonView';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import Spinner from '@/dls/Spinner/Spinner';
import layoutStyles from '@/pages/index.module.scss';
import ApiErrorMessage from '@/types/ApiErrorMessage';
import { Lesson } from '@/types/auth/Course';
import { fetcher, privateFetcher } from '@/utils/auth/api';
import { makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { isUserOrGuestEnrolled } from '@/utils/auth/guestCourseEnrollment';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getCanonicalUrl,
  getCourseNavigationUrl,
  getLessonNavigationUrl,
} from '@/utils/navigation';

const Loading = () => (
  <div className={layoutStyles.loadingContainer}>
    <Spinner />
  </div>
);

const NotEnrolledMessage = ({
  slug,
  onUnEnrolledNavigationLinkClicked,
}: {
  slug: string;
  onUnEnrolledNavigationLinkClicked: () => void;
}) => (
  <div className={styles.container}>
    <PageContainer>
      <Trans
        i18nKey="learn:not-enrolled"
        components={{
          link: (
            <Link
              onClick={onUnEnrolledNavigationLinkClicked}
              key={0}
              href={getCourseNavigationUrl(slug)}
              variant={LinkVariant.Blend}
            />
          ),
        }}
      />
    </PageContainer>
  </div>
);

const LessonPage: NextPage = () => {
  const { lang } = useTranslation('learn');
  const router = useRouter();
  const { slug, lessonSlugOrId } = router.query;
  const userIsLoggedIn = isLoggedIn();

  const onUnEnrolledNavigationLinkClicked = () => {
    logButtonClick('unenrolled_course_link', { courseSlugOrId: slug, lessonSlugOrId });
  };

  const renderError = (error: any) => {
    if (error?.message === ApiErrorMessage.CourseNotEnrolled) {
      return (
        <NotEnrolledMessage
          slug={slug as string}
          onUnEnrolledNavigationLinkClicked={onUnEnrolledNavigationLinkClicked}
        />
      );
    }
    return undefined;
  };

  const bodyRenderer = (lesson: Lesson) => {
    if (!lesson) return null;

    // Check if guest user has access to this lesson
    if (!userIsLoggedIn) {
      const courseId = lesson.course?.id;
      const allowGuestAccess = lesson.course?.allowGuestAccess;
      const isEnrolled = isUserOrGuestEnrolled(courseId, lesson.course?.isUserEnrolled);

      // If course doesn't allow guest access OR guest hasn't enrolled, show not enrolled message
      if (!allowGuestAccess || !isEnrolled) {
        return (
          <NotEnrolledMessage
            slug={slug as string}
            onUnEnrolledNavigationLinkClicked={onUnEnrolledNavigationLinkClicked}
          />
        );
      }
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

  return (
    <div className={layoutStyles.pageContainer}>
      <DataFetcher
        loading={Loading}
        queryKey={makeGetLessonUrl(slug as string, lessonSlugOrId as string)}
        fetcher={userIsLoggedIn ? privateFetcher : fetcher}
        renderError={renderError}
        render={bodyRenderer}
      />
    </div>
  );
};

export default LessonPage;
