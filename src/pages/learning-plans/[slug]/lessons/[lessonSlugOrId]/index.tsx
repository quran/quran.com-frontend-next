/* eslint-disable react/no-multi-comp */
import { useEffect, useRef } from 'react';

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
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { useIsEnrolled } from '@/hooks/auth/useGuestEnrollment';
import layoutStyles from '@/pages/index.module.scss';
import ApiErrorMessage from '@/types/ApiErrorMessage';
import { Lesson } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getCanonicalUrl,
  getCourseNavigationUrl,
  getLessonNavigationUrl,
} from '@/utils/navigation';
import { stripHTMLTags } from '@/utils/string';

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
  const noticeToast = useToast();

  const onUnEnrolledNavigationLinkClicked = () => {
    logButtonClick('unenrolled_course_link', { courseSlugOrId: slug, lessonSlugOrId });
  };

  const NotEnrolledNotice: React.FC = () => {
    const { t: tLearn } = useTranslation('learn');
    const noticeRouter = useRouter();
    const hasHandledNotEnrolledRef = useRef(false);

    useEffect(() => {
      if (hasHandledNotEnrolledRef.current) return;
      noticeToast(stripHTMLTags(tLearn('not-enrolled')), { status: ToastStatus.Error });
      noticeRouter.replace(getCourseNavigationUrl(slug as string));
      hasHandledNotEnrolledRef.current = true;
    }, [tLearn, noticeRouter]);

    return (
      <div className={styles.container}>
        <PageContainer>
          <Trans
            i18nKey="learn:not-enrolled"
            components={{
              link: (
                <Link
                  onClick={onUnEnrolledNavigationLinkClicked}
                  href={getCourseNavigationUrl(slug as string)}
                  variant={LinkVariant.Blend}
                />
              ),
            }}
          />
        </PageContainer>
      </div>
    );
  };

  const renderError = (error: any) => {
    if (error?.message === ApiErrorMessage.CourseNotEnrolled) {
      return <NotEnrolledNotice />;
    }
    return undefined;
  };

  const LessonContent: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
    const isEnrolled = useIsEnrolled(lesson.course.id, lesson.course.isUserEnrolled);

    if (isEnrolled === false) {
      return <NotEnrolledNotice />;
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
