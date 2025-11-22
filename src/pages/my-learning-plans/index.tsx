import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import withAuth from '@/components/Auth/withAuth';
import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getMyCoursesNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

const MyLearningPlanPage: NextPage = () => {
  const { t, lang } = useTranslation('learn');
  return (
    <>
      <NextSeoWrapper
        title={t('common:my-learning-plans')}
        url={getCanonicalUrl(lang, getMyCoursesNavigationUrl())}
        languageAlternates={getLanguageAlternates(getMyCoursesNavigationUrl())}
        nofollow
        noindex
      />
      <CoursesPageLayout isMyCourses />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/my-learning-plans');

export default withAuth(MyLearningPlanPage);
