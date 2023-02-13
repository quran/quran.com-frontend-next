import { useMemo } from 'react';

import classNames from 'classnames';
import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingStreak.module.scss';

import CheckIcon from '@/icons/check.svg';

interface Props {
  isTodaysGoalDone: boolean;
}

const getDaysOfWeek = (t: Translate) => [
  t('week.saturday'),
  t('week.sunday'),
  t('week.monday'),
  t('week.tuesday'),
  t('week.wednesday'),
  t('week.thursday'),
  t('week.friday'),
];

const CurrentWeekProgress: React.FC<Props> = ({ isTodaysGoalDone }) => {
  const { t } = useTranslation('reading-goal');

  // TODO: check the user's activty on each day
  const weekDays = useMemo(() => {
    const days = getDaysOfWeek(t);
    const today = new Date().getDay();
    return days.map((day, index) => ({ name: day, current: index === today + 1 }));
  }, [t]);

  return (
    <div className={styles.week}>
      {weekDays.map((day, idx) => (
        <div key={day.name} className={styles.day}>
          {day.name}
          <div className={styles.circleContainer}>
            <div className={classNames(styles.dayCircle, day.current && styles.filled)}>
              {day.current && isTodaysGoalDone && <CheckIcon />}
            </div>
            {idx !== weekDays.length - 1 && <div className={styles.dayDivider} />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CurrentWeekProgress;
