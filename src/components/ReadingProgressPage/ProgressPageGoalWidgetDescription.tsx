import Trans from 'next-translate/Trans';

import styles from './ReadingProgressPage.module.scss';

import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { GoalType } from '@/types/auth/Goal';
import ChaptersData from '@/types/ChaptersData';
import { getChapterData } from '@/utils/chapter';
import { secondsToShortReadableFormat } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';
import { convertNumberToDecimal } from '@/utils/number';
import { parseVerseRange } from '@/utils/verseKeys';

interface Props {
  goal: StreakWithMetadata['goal'];
  t: (key: string, values?: Record<string, unknown>) => string;
  lang: string;
  currentActivityDay: CurrentQuranActivityDay;
  chaptersData: ChaptersData;
}

const ProgressPageGoalWidgetDescription: React.FC<Props> = ({
  goal,
  t,
  lang,
  currentActivityDay,
  chaptersData,
}) => {
  if (!goal) {
    return null;
  }

  if (goal.isCompleted) {
    return (
      <p className={styles.progressWidgetDaysLeft}>{t('reading-goal:daily-progress-completed')}</p>
    );
  }

  if (typeof goal.progress.daysLeft === 'number') {
    return (
      <p>
        <Trans
          i18nKey="reading-goal:remaining-days"
          values={{
            count: goal.progress.daysLeft,
            days: toLocalizedNumber(goal.progress.daysLeft, lang),
          }}
          components={{
            p: <p />,
            span: <span />,
          }}
        />
      </p>
    );
  }

  if (goal.type === GoalType.TIME) {
    return (
      <p className={styles.progressWidgetDaysLeft}>
        <span>{`${t('reading-goal:remaining-base')}: `}</span>
        {secondsToShortReadableFormat(goal.progress.amountLeft, lang)}
      </p>
    );
  }

  if (goal.type === GoalType.PAGES) {
    return (
      <p className={styles.progressWidgetDaysLeft}>
        <span>{`${t('reading-goal:remaining-base')}: `}</span>
        {`(${toLocalizedNumber(convertNumberToDecimal(goal.progress.amountLeft, 2), lang)} ${t(
          'pages',
        )})`}
      </p>
    );
  }

  if (goal.type === GoalType.RANGE) {
    const ranges = currentActivityDay?.remainingDailyTargetRanges || [];
    if (ranges.length > 0) {
      const parsedRange = parseVerseRange(ranges[0]);
      if (!parsedRange) {
        return null;
      }
      const [{ chapter: fromChapter, verse: fromVerse }] = parsedRange;

      return (
        <p className={styles.progressWidgetDaysLeft}>
          <span>{`${t('reading-goal:remaining-base')}: `}</span>
          {`(${getChapterData(chaptersData, fromChapter).transliteratedName} ${toLocalizedNumber(
            Number(fromVerse),
            lang,
          )})`}
        </p>
      );
    }
  }

  return null;
};

export default ProgressPageGoalWidgetDescription;
