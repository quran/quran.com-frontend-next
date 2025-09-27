/* eslint-disable react/no-multi-comp */
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './lessons.module.scss';

import withAuth from '@/components/Auth/withAuth';
import LessonView from '@/components/Course/LessonView';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import { getCourseBySlug } from '@/components/Sanity/utils';
import Link, { LinkVariant } from '@/dls/Link/Link';
import Spinner from '@/dls/Spinner/Spinner';
import { logError } from '@/lib/newrelic';
import layoutStyles from '@/pages/index.module.scss';
import ApiErrorMessage from '@/types/ApiErrorMessage';
import { Lesson } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { getAllChaptersData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getCanonicalUrl,
  getCourseNavigationUrl,
  getLessonNavigationUrl,
} from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

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
        <div className={styles.container}>
          <PageContainer>
            <Trans
              i18nKey="learn:not-enrolled"
              components={{
                link: (
                  <Link
                    onClick={onUnEnrolledNavigationLinkClicked}
                    key={0}
                    href={getCourseNavigationUrl(slug as string)}
                    variant={LinkVariant.Blend}
                  />
                ),
              }}
            />
          </PageContainer>
        </div>
      );
    }
    return undefined;
  };

  const bodyRenderer = ((lesson: Lesson) => {
    if (lesson) {
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

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/learning-plans/[slug]/lessons/[lessonSlugOrId]',
  async (context) => {
    const { params, locale } = context;
    const { slug } = params;

    try {
      const chaptersData = await getAllChaptersData(locale);

      return {
        props: {
          chaptersData,
        },
      };
    } catch (error) {
      logError('Error occurred while getting chapters data', {
        error,
        slug,
      });
      return {
        props: {
          hasError: true,
        },
      };
    }
  },
);

export default withAuth(LessonPage);
