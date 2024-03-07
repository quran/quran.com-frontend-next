import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import withAuth from '@/components/Auth/withAuth';
import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getMyCoursesNavigationUrl } from '@/utils/navigation';

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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default withAuth(MyLearningPlanPage);
