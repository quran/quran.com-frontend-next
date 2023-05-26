import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import DataContext from '@/contexts/DataContext';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import { GoalType } from '@/types/auth/Goal';
import { getChapterData } from '@/utils/chapter';
import { secondsToReadableFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { convertFractionToPercent, convertNumberToDecimal } from '@/utils/number';
import { parseVerseRange } from '@/utils/verseKeys';

interface ReadingGoalAmountProps {
  goal?: StreakWithMetadata['goal'];
  currentActivityDay?: StreakWithMetadata['weekData']['readingDaysMap'][string];
  context: 'home_page' | 'quran_reader' | 'progress_page';
}

const ReadingGoalAmount: React.FC<ReadingGoalAmountProps> = ({
  goal,
  currentActivityDay,
  context,
}) => {
  const { t, lang } = useTranslation('reading-goal');
  const chaptersData = useContext(DataContext);
  const percent = convertFractionToPercent(currentActivityDay?.progress || 0);

  if (!goal || !goal.progress) return null;

  const { progress, type: goalType } = goal;
  const prefix = percent === 0 ? t('todays-goal') : t('remaining');

  let action: string | React.ReactNode = '';

  const handleRangeClick = (range: 'from' | 'to', verseKey: string) => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      logButtonClick(`${context}_goal_range_${range}`, { verse_key: verseKey });
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
    const all = [];

    currentActivityDay?.remainingDailyTargetRanges?.forEach((range) => {
      const [
        { chapter: fromChapter, verse: fromVerse, verseKey: rangeFrom },
        { chapter: toChapter, verse: toVerse, verseKey: rangeTo },
      ] = parseVerseRange(range);

      const from = `${
        getChapterData(chaptersData, fromChapter).transliteratedName
      } ${toLocalizedNumber(Number(fromVerse), lang)}`;

      const to = `${getChapterData(chaptersData, toChapter).transliteratedName} ${toLocalizedNumber(
        Number(toVerse),
        lang,
      )}`;

      all.push(
        <>
          <Link
            href={getChapterWithStartingVerseUrl(rangeFrom)}
            variant={LinkVariant.Blend}
            onClick={handleRangeClick('from', rangeFrom)}
          >
            {from}
          </Link>
          {` ${t('common:to')} `}
          <Link
            href={getChapterWithStartingVerseUrl(rangeTo)}
            variant={LinkVariant.Blend}
            onClick={handleRangeClick('to', rangeFrom)}
          >
            {to}
          </Link>
        </>,
      );
    });

    action =
      all.length > 1 ? (
        <ul>
          {all.map((range, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={idx}>{range}</div>
          ))}
        </ul>
      ) : (
        all
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
