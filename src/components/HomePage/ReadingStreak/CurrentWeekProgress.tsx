import { useMemo } from 'react';

import classNames from 'classnames';
import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingStreak.module.scss';

import useGetAllReadingDays from '@/hooks/auth/useGetAllReadingDays';
import CheckIcon from '@/icons/check.svg';
import { dateToDateString } from '@/utils/datetime';

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

    return days.map((day, index) => {
      const date = new Date();
      const dayIndex = days.indexOf(day);
      date.setDate(date.getDate() + dayIndex - today - 1);

      return {
        name: day,
        current: index === today + 1,
        date: dateToDateString(date),
      };
    });
  }, [t]);

  const { readingDays } = useGetAllReadingDays(
    weekDays[0].date,
    weekDays[weekDays.length - 1].date,
  );

  const readingDaysSet = useMemo(() => {
    if (!readingDays?.data) return new Set<string>();

    // we know this is a string because we parse it on the server
    return new Set(readingDays.data.map((day) => day.date as unknown as string));
  }, [readingDays]);

  const isDayChecked = (day: typeof weekDays[number]) => {
    if (day.current && isTodaysGoalDone) return true;
    if (readingDaysSet.has(day.date)) return true;
    return false;
  };

  return (
    <div className={styles.week}>
      {weekDays.map((day, idx) => (
        <div key={day.name} className={styles.day}>
          {day.name}
          <div className={styles.circleContainer}>
            <div
              className={classNames(
                styles.dayCircle,
                (day.current || isDayChecked(day)) && styles.filled,
              )}
            >
              {isDayChecked(day) ? <CheckIcon /> : null}
            </div>
            {idx !== weekDays.length - 1 && <div className={styles.dayDivider} />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CurrentWeekProgress;
