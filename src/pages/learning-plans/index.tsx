import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { fetcher } from '@/api';
import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getLearningPlansImageUrl } from '@/lib/og';
import { Course, CoursesResponse } from '@/types/auth/Course';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCoursesNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';
import ChaptersData from 'types/ChaptersData';

type LearningPlansPageProps = {
  courses: Course[];
};

const LearningPlansPage: NextPage<LearningPlansPageProps> = ({ courses }) => {
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
      <CoursesPageLayout initialCourses={courses} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/learning-plans',
  async (context, languageResult) => {
    const { chaptersData } = context as typeof context & { chaptersData: ChaptersData };

    const learningPlanLanguages =
      languageResult?.countryLanguagePreference?.learningPlanLanguages?.map((lang) =>
        lang.isoCode?.toLowerCase(),
      ) || ['en'];

    let courses: Course[] = [];
    try {
      const response = await fetcher<CoursesResponse>(
        makeGetCoursesUrl({ myCourses: false, languages: learningPlanLanguages }),
      );
      courses = response?.data || [];
    } catch (error) {
      courses = [];
    }

    return {
      props: {
        chaptersData,
        courses,
      },
    };
  },
);

export default LearningPlansPage;
