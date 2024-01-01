/* eslint-disable react/no-multi-comp */
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import LessonView from '@/components/Course/LessonView';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Spinner from '@/dls/Spinner/Spinner';
import useRequireAuth from '@/hooks/auth/useRequireAuth';
import styles from '@/pages/courses/[slug]/courses.module.scss';
import layoutStyles from '@/pages/index.module.scss';
import { Lesson } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { getCanonicalUrl, getLessonNavigationUrl } from '@/utils/navigation';

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
  useRequireAuth();
  const { lang } = useTranslation();
  const router = useRouter();
  const { slug, lessonSlugOrId } = router.query;

  return (
    <div className={layoutStyles.pageContainer}>
      <div className={styles.container}>
        <PageContainer>
          <DataFetcher
            loading={Loading}
            queryKey={makeGetLessonUrl(slug as string, lessonSlugOrId as string)}
            fetcher={privateFetcher}
            render={
              ((lesson: Lesson) => (
                <>
                  <NextSeoWrapper
                    title={lesson.title}
                    url={getCanonicalUrl(
                      lang,
                      getLessonNavigationUrl(slug as string, lessonSlugOrId as string),
                    )}
                  />
                  <LessonView lesson={lesson} />
                </>
              )) as any
            }
          />
        </PageContainer>
      </div>
    </div>
  );
};

export default LessonPage;
