import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import DayCircle, { DayState } from './DayCircle';
import styles from './ReadingStreak.module.scss';

import { ContentSide } from '@/dls/Popover';
import HoverablePopover from '@/dls/Popover/HoverablePopover';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import { compareDateWithToday, dateToReadableFormat } from '@/utils/datetime';
import { convertFractionToPercent } from '@/utils/number';

interface Props {
  weekData: ReturnType<typeof useGetStreakWithMetadata>['weekData'];
  goal?: ReturnType<typeof useGetStreakWithMetadata>['goal'];
}

const CurrentWeekProgress: React.FC<Props> = ({ weekData, goal }) => {
  const { lang, t } = useTranslation();
  const { days, readingDaysMap } = weekData;

  const getDayState = (day: (typeof days)[number]): [DayState, boolean] => {
    const { today, normalizedDate, isToday } = compareDateWithToday(day.date);

    const readingDay = readingDaysMap[day.dateString];
    const hasRead = readingDay?.hasRead;

    // if the user has a goal, we want to show a checked circle if the user has completed his goal for the day
    // otherwise, we want to show a checked circle if the user has read at all for the day
    const isGoalDone = goal ? convertFractionToPercent(readingDay?.progress || 0) >= 100 : hasRead;

    if (isGoalDone) return [DayState.Checked, isToday];

    if (normalizedDate > today) return [DayState.Future, isToday];

    return [DayState.None, isToday];
  };

  return (
    <div className={styles.currentWeekProgress}>
      <p className={styles.weekProgressLabel}>{t('reading-goal:week-progress')}:</p>
      <div className={styles.week}>
        {days.map((day) => {
          const [dayState, isToday] = getDayState(day);

          return (
            <div key={day.info.localizedNumber} className={styles.day}>
              <div className={styles.circleContainer}>
                <DayCircle state={dayState} />
              </div>
              <HoverablePopover
                content={dateToReadableFormat(day.date, lang)}
                contentSide={ContentSide.BOTTOM}
              >
                <span
                  className={classNames(styles.shortName, {
                    [styles.textBold]: isToday,
                  })}
                >
                  {dayState === DayState.Future || isToday
                    ? day.info.localizedNumber
                    : day.info.shortName}
                </span>
              </HoverablePopover>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CurrentWeekProgress;
