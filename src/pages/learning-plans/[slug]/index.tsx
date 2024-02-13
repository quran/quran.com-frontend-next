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
import layoutStyles from '@/pages/index.module.scss';
import { Course } from '@/types/auth/Course';
import { getCourse, privateFetcher } from '@/utils/auth/api';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';
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
  hasError?: boolean;
  page?: any[];
  course: Course;
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const course = await getCourse(params.slug as string);
    return {
      props: {
        course,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    return {
      props: {
        hasError: true,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
};

export default LearningPlanPage;
