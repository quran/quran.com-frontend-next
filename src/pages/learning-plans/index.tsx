import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { fetcher } from '@/api';
import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getLearningPlansImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import { Course } from '@/types/auth/Course';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCoursesNavigationUrl } from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';
import { getBasePath } from '@/utils/url';

type LearningPlansPageProps = {
  courses?: Course[];
};

const LearningPlansPage: NextPage<LearningPlansPageProps> = ({ courses }) => {
  const { t, lang } = useTranslation('learn');
  const initialCourses = courses && courses.length > 0 ? courses : undefined;

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
      <CoursesPageLayout initialCourses={initialCourses} />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);
  try {
    const response = await fetcher<{ data?: Course[] }>(makeGetCoursesUrl({ myCourses: false }), {
      headers: {
        origin: getBasePath(),
      },
    });
    return {
      props: {
        courses: response?.data ?? [],
        chaptersData: allChaptersData,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-LearningPlansPage',
    });
    return {
      props: {
        courses: [],
        chaptersData: allChaptersData,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export default LearningPlansPage;
