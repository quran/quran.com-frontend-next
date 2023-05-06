import { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingHistory.module.scss';
import ReadingStats from './ReadingStats';

import { ReadingDay } from '@/types/auth/ReadingDay';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';

interface DaysCalendarProps {
  month: { id: number; name: string; daysCount: number };
  year: number;
  days: ReadingDay[];
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}

const DaysCalendar: React.FC<DaysCalendarProps> = ({
  month,
  year,
  days,
  selectedDate,
  setSelectedDate,
}) => {
  const { lang } = useTranslation('reading-progress');

  // YYYY-MM
  const monthDate = `${year}-${month.id.toString().padStart(2, '0')}`;

  const dateToDayMap = useMemo(() => {
    const map: Record<string, ReadingDay> = {};

    days.forEach((day) => {
      if (!day.pagesRead && !day.secondsRead && !day.ranges.length) {
        return;
      }

      map[day.date as unknown as string] = day;
    });

    return map;
  }, [days]);

  if (selectedDate) {
    const readingDay = dateToDayMap[selectedDate];
    return <ReadingStats readingDay={readingDay} />;
  }

  const onDayClick = (date: string, dayNumber: number) => {
    logButtonClick('reading_history_day', {
      month: month.id,
      year,
      day: dayNumber,
    });
    setSelectedDate(date);
  };

  return (
    <div className={styles.calendarContainer}>
      {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
      {Array.from({ length: month.daysCount }).map((_, index) => {
        const day = index + 1;
        const date = `${monthDate}-${day.toString().padStart(2, '0')}`;
        const dayData = dateToDayMap[date];

        const isDisabled = !dayData;

        return (
          <div key={date} className={classNames(index > 6 && styles.bordered)}>
            <button
              type="button"
              disabled={isDisabled}
              className={classNames({ [styles.disabled]: isDisabled })}
              onClick={() => onDayClick(date, day)}
            >
              <time dateTime={date}>{toLocalizedNumber(day, lang)}</time>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default DaysCalendar;
