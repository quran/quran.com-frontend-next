import { useEffect } from 'react';

import classNames from 'classnames';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import layoutStyles from '../index.module.scss';

import styles from './reading-goal.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import ReadingGoalOnboarding from '@/components/ReadingGoalPage';
import {
  isReadingGoalExampleKey,
  ReadingGoalExampleKey,
} from '@/components/ReadingGoalPage/hooks/useReadingGoalReducer';
import Spinner from '@/dls/Spinner/Spinner';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import { isLoggedIn } from '@/utils/auth/login';
import { getLanguageAlternates } from '@/utils/locale';
import {
  getCanonicalUrl,
  getReadingGoalNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

const ReadingGoalPage: NextPage = () => {
  // we don't want to show the reading goal page if the user is not logged in
  const { t, lang } = useTranslation('reading-goal');
  const router = useRouter();

  // if the user already has a goal, redirect them to the home page
  const { goal, isLoading: isLoadingReadingGoal } = useGetStreakWithMetadata();
  const isLoading = isLoadingReadingGoal || !router.isReady || !!goal;

  const { example } = router.query;
  const initialExampleKey =
    isLoggedIn() && typeof example === 'string' && isReadingGoalExampleKey(example)
      ? (example as ReadingGoalExampleKey)
      : null;

  useEffect(() => {
    if (goal) {
      router.replace(getReadingGoalProgressNavigationUrl());
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
          {isLoading ? (
            <Spinner />
          ) : (
            <ReadingGoalOnboarding initialExampleKey={initialExampleKey} />
          )}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/reading-goal');

export default ReadingGoalPage;
