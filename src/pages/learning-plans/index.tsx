import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getLearningPlansImageUrl } from '@/lib/og';
import { CoursesResponse } from '@/types/auth/Course';
import { fetchCoursesWithLanguages } from '@/utils/auth/api';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCoursesNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';
import ChaptersData from 'types/ChaptersData';

type LearningPlansPageProps = {
  coursesResponse: CoursesResponse;
  initialLanguages: string[];
};

const LearningPlansPage: NextPage<LearningPlansPageProps> = ({
  coursesResponse,
  initialLanguages,
}) => {
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
      <CoursesPageLayout
        initialCoursesResponse={coursesResponse}
        initialLanguages={initialLanguages}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/learning-plans',
  async (context, languageResult) => {
    const { chaptersData } = context as typeof context & { chaptersData: ChaptersData };

    // Derive learningPlanLanguages from countryLanguagePreference; fallback to ['en'] if not available
    // Filter out null/undefined isoCode values and convert to lowercase (type-guarded as string[])
    const learningPlanLanguages = languageResult?.countryLanguagePreference?.learningPlanLanguages
      ?.map((lang) => lang.isoCode)
      .filter((code): code is string => code != null)
      .map((code) => code.toLowerCase()) || ['en'];

    // Fetch courses with fallback retry for backward compatibility
    const coursesResponse = await fetchCoursesWithLanguages(learningPlanLanguages);

    return {
      props: {
        chaptersData,
        coursesResponse,
        initialLanguages: learningPlanLanguages,
      },
    };
  },
);

export default LearningPlansPage;
