import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import useRequireAuth from '@/hooks/auth/useRequireAuth';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getMyCoursesNavigationUrl } from '@/utils/navigation';

const MyCoursesPage: NextPage = () => {
  const { t, lang } = useTranslation('learn');
  useRequireAuth();

  return (
    <>
      <NextSeoWrapper
        title={t('common:my-knowledge-boosters')}
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

export default MyCoursesPage;
