import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from '../index.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import ReadingGoalOnboarding from '@/components/ReadingGoalPage';
import useRequireAuth from '@/hooks/auth/useRequireAuth';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getReadingGoalNavigationUrl } from '@/utils/navigation';

const ReadingGoalPage: NextPage = () => {
  // we don't want to show the reading goal page if the user is not logged in
  useRequireAuth();

  const { t, lang } = useTranslation('reading-goal');

  return (
    <>
      <NextSeoWrapper
        title={t('reading-goal')}
        url={getCanonicalUrl(lang, getReadingGoalNavigationUrl())}
        languageAlternates={getLanguageAlternates(getReadingGoalNavigationUrl())}
        nofollow
        noindex
      />
      <div className={layoutStyle.pageContainer}>
        <div className={layoutStyle.flow}>
          <ReadingGoalOnboarding />
        </div>
      </div>
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

export default ReadingGoalPage;
