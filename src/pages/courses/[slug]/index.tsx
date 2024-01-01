/* eslint-disable react/no-multi-comp */
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './courses.module.scss';

import CourseDetails from '@/components/Course/CourseDetails';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Spinner from '@/dls/Spinner/Spinner';
import layoutStyles from '@/pages/index.module.scss';
import { Course } from '@/types/auth/Course';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';
import { getCanonicalUrl, getCourseNavigationUrl } from '@/utils/navigation';

const Loading = () => (
  <div className={layoutStyles.loadingContainer}>
    <Spinner />
  </div>
);

interface Props {
  hasError?: boolean;
  page?: any[];
}

const CoursePage: NextPage<Props> = () => {
  const { lang } = useTranslation();
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div className={layoutStyles.pageContainer}>
      <div className={styles.container}>
        <PageContainer>
          <DataFetcher
            loading={Loading}
            queryKey={makeGetCourseUrl(slug as string, { withLessons: true })}
            render={
              ((course: Course) => (
                <>
                  <NextSeoWrapper
                    title={course.title}
                    url={getCanonicalUrl(lang, getCourseNavigationUrl(course.id))}
                  />
                  <CourseDetails course={course} />
                </>
              )) as any
            }
          />
        </PageContainer>
      </div>
    </div>
  );
};

export default CoursePage;
