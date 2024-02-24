import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './QuranReaderStreak.module.scss';

import CurrentWeekProgress from '@/components/HomePage/QuranGrowthJourneySection/CollapsibleSection/QuranReadingGoals/CurrentWeekProgress';
import ReadingGoalAmount, {
  ReadingGoalAmountContext,
} from '@/components/ReadingGoal/ReadingGoalAmount';
import Progress from '@/dls/Progress';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { QuranGoalStatus } from '@/types/auth/Goal';
import { toLocalizedNumber } from '@/utils/locale';

type Props = {
  percent: number;
  isGoalDone: boolean;
  goal: QuranGoalStatus;
  // TODO: strongly type this
  weekData: any;
  currentActivityDay: CurrentQuranActivityDay;
};

const QuranReaderStreak: React.FC<Props> = ({
  percent,
  isGoalDone,
  goal,
  currentActivityDay,
  weekData,
}) => {
  const { t, lang } = useTranslation('reading-goal');
  const localizedPercent = toLocalizedNumber(percent, lang);
  if (!isGoalDone && !goal.isCompleted) {
    return (
      <div className={styles.dailyProgressContainer}>
        <p className={styles.streakTitle}>{t('daily-progress')}</p>
        <p className={styles.dailyGoal}>
          <ReadingGoalAmount
            currentActivityDay={currentActivityDay}
            goal={goal}
            context={ReadingGoalAmountContext.QuranReader}
          />
        </p>
        <div className={styles.progressContainer}>
          <Progress value={percent} />
          <div className={styles.progressTextContainer}>
            <p>{localizedPercent}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.dailyProgressContainer}>
        <p className={styles.streakTitle}>{t('goal-done.title')}</p>
        <p className={styles.dailyGoal}>{t('goal-done.description')}</p>
      </div>
      <CurrentWeekProgress goal={goal} weekData={weekData} />
    </>
  );
};

export default QuranReaderStreak;
