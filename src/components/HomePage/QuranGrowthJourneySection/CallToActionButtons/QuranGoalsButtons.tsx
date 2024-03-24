import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CallToActionButtons.module.scss';

import GoalButtons from '@/components/HomePage/QuranGrowthJourneySection/CollapsibleSection/QuranReadingGoals/GoalButtons';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl, getReadingGoalNavigationUrl } from '@/utils/navigation';

const QuranGoalsButtons = () => {
  const { t } = useTranslation('reading-goal');
  const { goal, currentActivityDay } = useGetStreakWithMetadata({
    disableIfNoGoalExists: false,
  });
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys();

  const nextVerseToRead = goal?.progress?.nextVerseToRead ?? recentlyReadVerseKeys[0];

  const onCreateReadingGoalClick = (e) => {
    // don't toggle collapsible parent when clicking
    e.stopPropagation();
    logButtonClick('homepage_qgj_create_goal');
  };

  if (goal) {
    return (
      <GoalButtons nextVerseToRead={nextVerseToRead} currentActivityDay={currentActivityDay} />
    );
  }

  const url = getReadingGoalNavigationUrl();

  return (
    <div className={styles.buttonsContainer}>
      <Button
        onClick={onCreateReadingGoalClick}
        size={ButtonSize.Small}
        type={ButtonType.Success}
        href={isLoggedIn() ? url : getLoginNavigationUrl(url)}
      >
        {t('create-reading-goal')}
      </Button>
    </div>
  );
};

export default QuranGoalsButtons;
