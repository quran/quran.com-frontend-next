import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import ReadingGoalAmount, {
  ReadingGoalAmountContext,
} from '@/components/ReadingGoal/ReadingGoalAmount';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { QuranGoalStatus } from '@/types/auth/Goal';

type Props = {
  currentActivityDay: CurrentQuranActivityDay;
  goal: QuranGoalStatus;
  percent: number;
  isQuranReader: boolean;
};

const GoalStatus: React.FC<Props> = ({ currentActivityDay, goal, percent, isQuranReader }) => {
  const { t } = useTranslation('reading-goal');
  if (!goal) return null;

  if (goal.isCompleted) {
    return t('progress.goal-complete');
  }

  if (percent < 100) {
    return (
      <ReadingGoalAmount
        currentActivityDay={currentActivityDay}
        goal={goal}
        context={
          isQuranReader ? ReadingGoalAmountContext.QuranReader : ReadingGoalAmountContext.HomePage
        }
      />
    );
  }
  return t('progress.complete');
};

export default GoalStatus;
