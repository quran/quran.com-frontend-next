import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import DayCircle, { DayState } from './DayCircle';
import styles from './ReadingStreak.module.scss';

import { ContentSide } from '@/dls/Popover';
import HoverablePopover from '@/dls/Popover/HoverablePopover';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import { dateToReadableFormat } from '@/utils/datetime';
import { convertFractionToPercent } from '@/utils/number';

interface Props {
  weekData: ReturnType<typeof useGetStreakWithMetadata>['weekData'];
  goal?: ReturnType<typeof useGetStreakWithMetadata>['goal'];
  fixedWidth?: boolean;
}

const CurrentWeekProgress: React.FC<Props> = ({ weekData, goal, fixedWidth = true }) => {
  const { lang, t } = useTranslation();
  const { days, readingDaysMap } = weekData;

  const getDayState = (day: (typeof days)[number]): DayState => {
    const readingDay = readingDaysMap[day.dateString];
    const hasRead = readingDay?.hasRead;

    // if the user has a goal, we want to show a checked circle if the user has completed his goal for the day
    // otherwise, we want to show a filled circle if the user has read at all for the day
    const isGoalDone = goal ? convertFractionToPercent(readingDay?.progress || 0) >= 100 : hasRead;

    if (isGoalDone) return DayState.Checked;
    if (hasRead) return DayState.Filled;

    return day.current ? DayState.Stroked : DayState.None;
  };

  return (
    <div>
      <p className={styles.weekProgressLabel}>{t('reading-goal:week-progress')}</p>
      <div
        className={classNames(styles.week, {
          [styles.fixedWidth]: fixedWidth,
        })}
      >
        {days.map((day) => {
          const dayState = getDayState(day);

          return (
            <div key={day.info.localizedNumber} className={styles.day}>
              <HoverablePopover
                content={dateToReadableFormat(day.date, lang)}
                contentSide={ContentSide.TOP}
              >
                <span className={styles.fullName}>{day.info.title}</span>
                <span className={styles.shortName}>{day.info.localizedNumber}</span>
              </HoverablePopover>

              <div className={styles.circleContainer}>
                <DayCircle state={dayState} />

                <div className={styles.dayDivider} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CurrentWeekProgress;
