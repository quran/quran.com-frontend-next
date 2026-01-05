/* eslint-disable react/no-multi-comp */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './courses.module.scss';

import { fetcher } from '@/api';
import CourseDetails from '@/components/Course/CourseDetails';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Spinner from '@/dls/Spinner/Spinner';
import { logErrorToSentry } from '@/lib/sentry';
import layoutStyles from '@/pages/index.module.scss';
import { Course } from '@/types/auth/Course';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCourseNavigationUrl } from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';
import { getBasePath } from '@/utils/url';

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
  if (router.isFallback) {
    return <Loading />;
  }
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
            <CourseDetails course={course} />
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

// eslint-disable-next-line react-func/max-lines-per-function
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  try {
    const course = await fetcher<Course>(makeGetCourseUrl(params.slug as string), {
      headers: {
        origin: getBasePath(),
      },
    });
    const chaptersData = await getAllChaptersData(locale);
    return {
      props: {
        course,
        chaptersData,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
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
