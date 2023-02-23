import classNames from 'classnames';

import useGetWeekDays from './hooks/useGetWeekDays';
import styles from './ReadingStreak.module.scss';

import CheckIcon from '@/icons/check.svg';

interface Props {
  isTodaysGoalDone: boolean;
  weekData: ReturnType<typeof useGetWeekDays>;
}

const CurrentWeekProgress: React.FC<Props> = ({ isTodaysGoalDone, weekData }) => {
  const { weekDays, readingDaysMap } = weekData;

  const getDayState = (day: typeof weekDays[number]) => {
    const hasRead = readingDaysMap[day.date]?.hasRead;

    if (day.current) {
      if (isTodaysGoalDone) return 'checked';
      if (hasRead) return 'filled';
      return 'stroked';
    }

    if (hasRead) return 'checked';
    return 'none';
  };

  return (
    <div className={styles.week}>
      {weekDays.map((day, idx) => {
        const dayState = getDayState(day);

        return (
          <div key={day.name} className={styles.day}>
            {day.name}
            <div className={styles.circleContainer}>
              <div
                className={classNames(styles.dayCircle, {
                  [styles.filled]: dayState === 'filled' || dayState === 'checked',
                  [styles.stroked]: dayState === 'stroked',
                })}
              >
                {dayState === 'checked' ? <CheckIcon /> : null}
              </div>
              {idx !== weekDays.length - 1 && <div className={styles.dayDivider} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CurrentWeekProgress;
