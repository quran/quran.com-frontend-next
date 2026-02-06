/* eslint-disable react/no-multi-comp */
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './courses.module.scss';

import CourseDetails from '@/components/Course/CourseDetails';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Spinner from '@/dls/Spinner/Spinner';
import { logError } from '@/lib/newrelic';
import layoutStyles from '@/pages/index.module.scss';
import { Course } from '@/types/auth/Course';
import { getCourse, privateFetcher } from '@/utils/auth/api';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCourseNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

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

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/learning-plans/[slug]',
  async (context) => {
    const { params, locale } = context;
    const { slug } = params;

    try {
      const [course, chaptersData] = await Promise.all([
        getCourse(slug as string),
        getAllChaptersData(locale),
      ]);

      return {
        props: {
          course,
          chaptersData,
        },
      };
    } catch (error) {
      logError('Error occurred while getting course from Sanity', error as Error, {
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

export default LearningPlanPage;
