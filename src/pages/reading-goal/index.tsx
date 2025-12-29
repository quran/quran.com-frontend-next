import { useEffect } from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import layoutStyles from '../index.module.scss';

import styles from './reading-goal.module.scss';

import withAuth from '@/components/Auth/withAuth';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import ReadingGoalOnboarding from '@/components/ReadingGoalPage';
import Spinner from '@/dls/Spinner/Spinner';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getReadingGoalNavigationUrl } from '@/utils/navigation';

const ReadingGoalPage: NextPage = () => {
  // we don't want to show the reading goal page if the user is not logged in
  const { t, lang } = useTranslation('reading-goal');
  const router = useRouter();

  // if the user already has a goal, redirect them to the home page
  const { goal, isLoading: isLoadingReadingGoal } = useGetStreakWithMetadata();
  const isLoading = isLoadingReadingGoal || !router.isReady || !!goal;

  useEffect(() => {
    if (goal) {
      router.push('/');
    }
  }, [router, goal]);

  return (
    <>
      <NextSeoWrapper
        title={t('reading-goal')}
        url={getCanonicalUrl(lang, getReadingGoalNavigationUrl())}
        languageAlternates={getLanguageAlternates(getReadingGoalNavigationUrl())}
        nofollow
        noindex
      />

      <div className={layoutStyles.pageContainer}>
        <div className={classNames(layoutStyles.flow, isLoading && styles.loadingContainer)}>
          {isLoading ? <Spinner /> : <ReadingGoalOnboarding />}
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

export default withAuth(ReadingGoalPage);
