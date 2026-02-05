import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import withAuth from '@/components/Auth/withAuth';
import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getAllChaptersData } from '@/utils/chapter';
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
      <CoursesPageLayout isMyCourses lang={lang} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/my-learning-plans',
  async (context) => {
    const { locale } = context;
    const allChaptersData = await getAllChaptersData(locale);

    return {
      props: {
        chaptersData: allChaptersData,
      },
    };
  },
);

export default withAuth(MyLearningPlanPage);
