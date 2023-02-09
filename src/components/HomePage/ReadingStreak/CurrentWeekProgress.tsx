import { useMemo } from 'react';

import classNames from 'classnames';

import styles from './ReadingStreak.module.scss';

import CheckIcon from '@/icons/check.svg';

interface Props {
  isTodaysGoalDone: boolean;
}

const CurrentWeekProgress: React.FC<Props> = ({ isTodaysGoalDone }) => {
  const week = useMemo(() => {
    const days = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];
    const today = new Date().getDay();
    return days.map((day, index) => ({ name: day, current: index === today + 1 }));
  }, []);

  return (
    <div className={styles.week}>
      {week.map((day, idx) => (
        <div key={day.name} className={styles.day}>
          {day.name}
          <div className={styles.circleContainer}>
            <div className={classNames(styles.dayCircle, day.current && styles.filled)}>
              {day.current && isTodaysGoalDone && <CheckIcon />}
            </div>
            {idx !== week.length - 1 && <div className={styles.dayDivider} />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CurrentWeekProgress;
