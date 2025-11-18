/* eslint-disable react/no-multi-comp */
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';

import LessonContent from '@/components/Course/LessonContent';
import NotEnrolledNotice from '@/components/Course/NotEnrolledNotice';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import { logError } from '@/lib/newrelic';
import layoutStyles from '@/pages/index.module.scss';
import ApiErrorMessage from '@/types/ApiErrorMessage';
import { Lesson } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { getAllChaptersData } from '@/utils/chapter';
import withSsrRedux from '@/utils/withSsrRedux';

interface Props {
  hasError?: boolean;
  page?: any[];
}

const LessonPage: NextPage<Props> = () => {
  const router = useRouter();
  const { slug, lessonSlugOrId } = router.query;

  const renderError = (error: any) => {
    if (error?.message === ApiErrorMessage.CourseNotEnrolled) {
      return (
        <NotEnrolledNotice courseSlug={slug as string} lessonSlugOrId={lessonSlugOrId as string} />
      );
    }
    return undefined;
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
      logError('Error occurred while getting chapters data', error as Error, {
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

export default LessonPage;
