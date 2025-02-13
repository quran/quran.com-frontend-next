import React, { useContext } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './GoalStatus.module.scss';

import DataContext from '@/contexts/DataContext';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { GoalType, QuranGoalStatus } from '@/types/auth/Goal';
import { getChapterData } from '@/utils/chapter';
import { secondsToShortReadableFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl, getReadingGoalNavigationUrl } from '@/utils/navigation';
import { convertNumberToDecimal } from '@/utils/number';
import { parseVerseRange } from '@/utils/verseKeys';

type Props = {
  currentActivityDay: CurrentQuranActivityDay;
  goal: QuranGoalStatus;
  percent: number;
};

const GoalStatus: React.FC<Props> = ({ currentActivityDay, goal, percent }) => {
  const { t, lang } = useTranslation('reading-goal');
  const chaptersData = useContext(DataContext);
  if (!goal) return null;
  const goalType = goal.type;

  const onSetNewGoalClicked = () => {
    logButtonClick('homepage_reading_goal_status_set_new_goal');
  };

  const onChapterClicked = () => {
    logButtonClick('homepage_reading_goal_status_continue_from');
  };

  let header = t('daily-progress');
  let subSection = <></>;
  if (goal.isCompleted) {
    header = t('goal-completed');
    subSection = (
      <Link
        href={getReadingGoalNavigationUrl()}
        variant={LinkVariant.Blend}
        onClick={onSetNewGoalClicked}
      >
        <span className={styles.remainingValue}>{t('set-a-new-goal')}</span>
      </Link>
    );
  } else if (percent >= 100) {
    subSection = t('daily-progress-completed');
  } else if (typeof goal.progress.daysLeft === 'number') {
    subSection = (
      <Trans
        components={{
          p: <span className={styles.remaining} />,
          span: <span className={styles.remainingValue} />,
        }}
        values={{
          count: goal.progress.daysLeft,
          days: toLocalizedNumber(goal.progress.daysLeft, lang),
        }}
        i18nKey="reading-goal:remaining-days"
      />
    );
  } else if (goalType === GoalType.TIME) {
    subSection = (
      <>
        <span className={styles.remaining}>{`${t('remaining-base')}:`}</span>{' '}
        <span className={styles.remainingValue}>
          {secondsToShortReadableFormat(goal.progress.amountLeft, lang)}
        </span>
      </>
    );
  } else if (goalType === GoalType.PAGES) {
    subSection = (
      <>
        <span className={styles.remaining}>{`${t('remaining-base')}:`}</span>{' '}
        <span className={styles.remainingValue}>{`(${toLocalizedNumber(
          convertNumberToDecimal(goal.progress.amountLeft, 2),
          lang,
        )} ${t('pages')})`}</span>
      </>
    );
  } else if (goalType === GoalType.RANGE) {
    const ranges = currentActivityDay?.remainingDailyTargetRanges || [];
    if (ranges.length > 0) {
      const [{ chapter: fromChapter, verse: fromVerse, verseKey: rangeFrom }] = parseVerseRange(
        ranges[0],
      );
      subSection = (
        <>
          <span className={styles.remaining}>{`${t('remaining-base')}:`}</span>{' '}
          <Link
            href={getChapterWithStartingVerseUrl(rangeFrom)}
            variant={LinkVariant.Blend}
            onClick={onChapterClicked}
          >
            <span className={styles.remainingValue}>{`(${
              getChapterData(chaptersData, fromChapter).transliteratedName
            } ${toLocalizedNumber(Number(fromVerse), lang)})`}</span>
          </Link>
        </>
      );
    }
  }

  return (
    <div>
      <div className={styles.header}>{header}</div>
      <div className={styles.subSection}>{subSection}</div>
    </div>
  );
};

export default GoalStatus;
