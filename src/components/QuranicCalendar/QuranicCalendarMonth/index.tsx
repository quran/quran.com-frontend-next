import React from 'react';

import umalqura from '@umalqura/core';
import useTranslation from 'next-translate/useTranslation';

import styles from './QuranicCalendarMonth.module.scss';

import QuranicCalendarMonthData from '@/components/QuranicCalendar/types/QuranicCalendarMonthData';
import { toLocalizedDate } from '@/utils/locale';
import QuranicCalendarWeek from 'src/components/QuranicCalendar/QuranicCalendarWeek';

type Props = {
  monthWeeks: QuranicCalendarMonthData;
  monthOrder: number;
};

const QuranicCalendarMonth: React.FC<Props> = ({ monthWeeks, monthOrder }) => {
  const { lang } = useTranslation('quranic-calendar');
  const currentHijriDate = umalqura();
  const currentHijriWeekOfMonth = Math.ceil(currentHijriDate.hd / 7);
  const calendarMonth = umalqura(
    Number(monthWeeks[0].hijriYear),
    Number(monthWeeks[0].hijriMonth),
    1,
  );
  const isCurrentMonthAndYear =
    calendarMonth.hm === currentHijriDate.hm && currentHijriDate.hy === calendarMonth.hy;
  const localizedMonthAndYear = `${toLocalizedDate(calendarMonth.date, lang, {
    calendar: 'islamic',
    month: 'long',
  })} ${toLocalizedDate(calendarMonth.date, lang, {
    calendar: 'islamic',
    year: 'numeric',
  })}`;

  return (
    <div className={styles.container}>
      <div className={styles.monthHeader}>{localizedMonthAndYear}</div>
      {monthWeeks.map((week, index) => {
        const weekNumber = index + 1;
        const { ranges, day, month, year } = week;
        return (
          <QuranicCalendarWeek
            key={ranges}
            isCurrentWeek={isCurrentMonthAndYear && currentHijriWeekOfMonth === weekNumber}
            weekNumber={weekNumber}
            monthOrder={monthOrder}
            localizedMonthAndYear={localizedMonthAndYear}
            ranges={ranges}
            firstDayOfWeek={
              {
                day,
                month,
                year,
              } as unknown as { day: number; month: number; year: number }
            }
          />
        );
      })}
    </div>
  );
};

export default QuranicCalendarMonth;
