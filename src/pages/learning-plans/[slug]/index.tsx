/* eslint-disable react/no-multi-comp */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './courses.module.scss';

import CourseDetails from '@/components/Course/CourseDetails';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Spinner from '@/dls/Spinner/Spinner';
import { logErrorToSentry } from '@/lib/sentry';
import layoutStyles from '@/pages/index.module.scss';
import { Course } from '@/types/auth/Course';
import { getCourse, privateFetcher } from '@/utils/auth/api';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCourseNavigationUrl } from '@/utils/navigation';
import {
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from '@/utils/staticPageGeneration';

const Loading = () => (
  <div className={layoutStyles.loadingContainer}>
    <Spinner />
  </div>
);

interface Props {
  page?: any[];
  course: Course;
  chaptersData?: any;
}

const LearningPlanPage: NextPage<Props> = ({ course }) => {
  const { lang, t } = useTranslation('learn');
  const router = useRouter();
  const { slug } = router.query;

  const url = getCourseNavigationUrl(course.slug);

  return (
    <>
      <NextSeoWrapper
        title={course.title}
        canonical={getCanonicalUrl(lang, url)}
        description={course?.metaDescription || t('learning-plan-meta-desc')}
        languageAlternates={getLanguageAlternates(url)}
        image={course.thumbnail}
        imageWidth={1200}
        imageHeight={630}
      />
      <div className={layoutStyles.pageContainer}>
        <div className={styles.container}>
          <PageContainer>
            <DataFetcher
              loading={Loading}
              queryKey={makeGetCourseUrl(slug as string)}
              fetcher={privateFetcher}
              render={
                ((courseDetailsResponse: Course) => (
                  <>
                    <CourseDetails course={courseDetailsResponse} />
                  </>
                )) as any
              }
            />
          </PageContainer>
        </div>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  try {
    const course = await getCourse(params.slug as string);
    const chaptersData = await getAllChaptersData(locale);
    return {
      props: {
        course,
        chaptersData,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-LearningPlanPage',
      metadata: {
        slug: String(params.slug),
      },
    });
    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export default LearningPlanPage;
