import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './QuranGrowthJourneySection.module.scss';

import NoGoalOrStreakCard from '@/components/HomePage/ReadingSection/NoGoalOrStreakCard';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';

const QuranGrowthJourneySection = () => {
  const { t } = useTranslation('home');
  const { goal, streak } = useGetStreakWithMetadata({
    showDayName: true,
  });

  if (goal || streak) {
    return null;
  }

  return (
    <>
      <div className={styles.header}>
        <h1>{t('qgj.title')}</h1>
      </div>
      <NoGoalOrStreakCard />
    </>
  );
};

export default QuranGrowthJourneySection;
