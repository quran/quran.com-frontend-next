import classNames from 'classnames';

import styles from './ReadingStreak.module.scss';

import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import CheckIcon from '@/icons/check.svg';
import { convertFractionToPercent } from '@/utils/number';

enum DayState {
  None = 'none',
  Stroked = 'stroked',
  Filled = 'filled',
  Checked = 'checked',
}

interface Props {
  weekData: ReturnType<typeof useGetStreakWithMetadata>['weekData'];
  readingGoal?: ReturnType<typeof useGetStreakWithMetadata>['readingGoal'];
}

const CurrentWeekProgress: React.FC<Props> = ({ weekData, readingGoal }) => {
  const { days, readingDaysMap } = weekData;

  const getDayState = (day: typeof days[number]): DayState => {
    const readingDay = readingDaysMap[day.date];
    const hasRead = readingDay?.hasRead;

    // if the user has a goal, we want to show a checked circle if the user has completed his goal for the day
    // otherwise, we want to show a filled circle if the user has read at all for the day
    const isGoalDone = readingGoal
      ? convertFractionToPercent(readingDay?.progress || 0) >= 100
      : hasRead;

    if (isGoalDone) return DayState.Checked;
    if (hasRead) return DayState.Filled;

    return day.current ? DayState.Stroked : DayState.None;
  };

  return (
    <div className={styles.week}>
      {days.map((day, idx) => {
        const dayState = getDayState(day);

        return (
          <div key={day.name} className={styles.day}>
            {day.name}
            <div className={styles.circleContainer}>
              <div
                className={classNames(styles.dayCircle, {
                  [styles.filled]: dayState === DayState.Filled || dayState === DayState.Checked,
                  [styles.stroked]: dayState === DayState.Stroked,
                })}
              >
                {dayState === DayState.Checked ? <CheckIcon /> : null}
              </div>
              {idx !== days.length - 1 && <div className={styles.dayDivider} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CurrentWeekProgress;
