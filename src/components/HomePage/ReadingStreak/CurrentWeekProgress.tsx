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
}

const CurrentWeekProgress: React.FC<Props> = ({ weekData }) => {
  const { days, readingDaysMap } = weekData;

  const getDayState = (day: typeof days[number]): DayState => {
    const readingDay = readingDaysMap[day.date];
    const hasRead = readingDay?.hasRead;

    const isGoalDone = convertFractionToPercent(readingDay?.progress || 0) >= 100;

    if (day.current) {
      if (isGoalDone) return DayState.Checked;
      if (hasRead) return DayState.Filled;
      return DayState.Stroked;
    }

    if (hasRead) return DayState.Checked;
    return DayState.None;
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
