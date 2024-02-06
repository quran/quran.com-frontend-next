import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCoursesNavigationUrl } from '@/utils/navigation';

const CoursesPage: NextPage = () => {
  const { t, lang } = useTranslation('learn');

  return (
    <>
      <NextSeoWrapper
        title={t('common:knowledge-boosters')}
        canonical={getCanonicalUrl(lang, getCoursesNavigationUrl())}
        languageAlternates={getLanguageAlternates(getCoursesNavigationUrl())}
        description={t('boosters-meta-desc')}
      />
      <CoursesPageLayout />
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

export default CoursesPage;
