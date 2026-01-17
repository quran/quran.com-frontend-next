import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getLearningPlansImageUrl } from '@/lib/og';
import { CoursesResponse } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCoursesNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

type LearningPlansPageProps = {
  initialCoursesData?: CoursesResponse;
};

const LearningPlansPage: NextPage<LearningPlansPageProps> = ({ initialCoursesData }) => {
  const { t, lang } = useTranslation('learn');

  return (
    <>
      <NextSeoWrapper
        title={t('common:learning-plans')}
        canonical={getCanonicalUrl(lang, getCoursesNavigationUrl())}
        languageAlternates={getLanguageAlternates(getCoursesNavigationUrl())}
        description={t('learning-plans-meta-desc')}
        image={getLearningPlansImageUrl({
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
      />
      <CoursesPageLayout initialCoursesData={initialCoursesData} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/learning-plans',
  async (context, languageResult) => {
    const { locale } = context;
    const allChaptersData = await getAllChaptersData(locale);
    const learningPlanLanguages = languageResult.countryLanguagePreference?.learningPlanLanguages
      ?.map((lang) => lang.isoCode)
      .filter((code): code is string => Boolean(code))
      .map((code) => code.toLowerCase()) || ['en'];
    const coursesUrl = makeGetCoursesUrl({
      myCourses: false,
      languages: learningPlanLanguages,
    });
    const initialCoursesData = await privateFetcher(coursesUrl);

    return {
      props: {
        chaptersData: allChaptersData,
        initialCoursesData,
      },
    };
  },
);

export default LearningPlansPage;
