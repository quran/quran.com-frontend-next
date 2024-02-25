import useTranslation from 'next-translate/useTranslation';

import VerseRangesList from './VerseRangesList';

import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { GoalType } from '@/types/auth/Goal';
import { RangeItemDirection } from '@/types/Range';
import { secondsToReadableFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { convertFractionToPercent, convertNumberToDecimal } from '@/utils/number';

export enum ReadingGoalAmountContext {
  HomePage = 'home_page',
  QuranReader = 'quran_reader',
  ProgressPage = 'progress_page',
}

interface ReadingGoalAmountProps {
  goal?: StreakWithMetadata['goal'];
  currentActivityDay?: CurrentQuranActivityDay;
  context: ReadingGoalAmountContext;
}

const ReadingGoalAmount: React.FC<ReadingGoalAmountProps> = ({
  goal,
  currentActivityDay,
  context,
}) => {
  const { t, lang } = useTranslation('reading-goal');
  const percent = convertFractionToPercent(currentActivityDay?.progress || 0);

  if (!goal || !goal.progress) return null;

  const { progress, type: goalType } = goal;
  const prefix = percent === 0 ? t('todays-goal') : t('remaining');

  let action: string | React.ReactNode = '';

  const handleVerseClick = (direction: RangeItemDirection, verseKey: string) => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      logButtonClick(`${context}_goal_range_${direction}`, { verse_key: verseKey });
    };
  };

  if (goalType === GoalType.TIME) {
    action = t('progress.time-goal', {
      time: secondsToReadableFormat(progress.amountLeft, t, lang),
    });
  }

  if (goalType === GoalType.PAGES) {
    action = t('progress.pages-goal', {
      pages: toLocalizedNumber(convertNumberToDecimal(progress.amountLeft, 2), lang),
    });
  }

  if (goalType === GoalType.RANGE) {
    action = (
      <VerseRangesList
        ranges={currentActivityDay?.remainingDailyTargetRanges || []}
        onVerseClick={handleVerseClick}
      />
    );
  }

  return (
    <>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      {prefix}: {action}
      {typeof goal.progress.daysLeft === 'number' && (
        <>
          <br />
          {t('reading-goal:remaining-days', {
            count: goal.progress.daysLeft,
            days: toLocalizedNumber(goal.progress.daysLeft, lang),
          })}
        </>
      )}
    </>
  );
};

export default ReadingGoalAmount;
