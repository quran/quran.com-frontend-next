/* eslint-disable react/no-multi-comp */
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import layoutStyles from '../index.module.scss';

import styles from './courses.module.scss';

import CourseDetails from '@/components/Course/CourseDetails';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Spinner from '@/dls/Spinner/Spinner';
import useRequireAuth from '@/hooks/auth/useRequireAuth';
import { CourseResponse } from '@/types/auth/Course';
import { makeGetCourseUrl } from '@/utils/mockoon/apiPath';
import { getCanonicalUrl, getLessonNavigationUrl } from '@/utils/navigation';

const Loading = () => (
  <div className={layoutStyles.loadingContainer}>
    <Spinner />
  </div>
);
interface Props {
  hasError?: boolean;
  page?: any[];
}

const LessonPage: NextPage<Props> = () => {
  // we don't want to show the reading goal page if the user is not logged in
  useRequireAuth();
  const { lang } = useTranslation();
  const router = useRouter();
  const { slug } = router.query;
  return (
    <div className={layoutStyles.pageContainer}>
      <div className={styles.container}>
        <PageContainer>
          <DataFetcher
            loading={Loading}
            queryKey={makeGetCourseUrl(slug as string)}
            render={(data: CourseResponse) => (
              <>
                <NextSeoWrapper
                  // @ts-ignore
                  title={data.course.title}
                  // @ts-ignore
                  url={getCanonicalUrl(lang, getLessonNavigationUrl(data.course.id))}
                />
                <CourseDetails course={data.course} />
              </>
            )}
          />
        </PageContainer>
      </div>
    </div>
  );
};

export default LessonPage;
