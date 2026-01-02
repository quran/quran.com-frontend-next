import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import CoursesPageLayout from '@/components/Course/CoursesPageLayout';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getLearningPlansImageUrl } from '@/lib/og';
import { Course } from '@/types/auth/Course';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCoursesNavigationUrl } from '@/utils/navigation';

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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default LearningPlansPage;
