import React from 'react';

import umalqura from '@umalqura/core';
import useTranslation from 'next-translate/useTranslation';

import styles from './QuranicCalendarMonth.module.scss';

import QuranicCalendarMonthData from '@/components/QuranicCalendar/types/QuranicCalendarMonthData';
import QuranicCalendarWeek from 'src/components/QuranicCalendar/QuranicCalendarWeek';

type Props = {
  monthWeeks: QuranicCalendarMonthData;
  monthOrder: number;
};

const QuranicCalendarMonth: React.FC<Props> = ({ monthWeeks, monthOrder }) => {
  const { t } = useTranslation('quranic-calendar');
  const currentHijriDate = umalqura();
  const currentHijriWeekOfMonth = Math.ceil(currentHijriDate.hd / 7);
  const calendarMonth = umalqura(
    Number(monthWeeks[0].hijriYear),
    Number(monthWeeks[0].hijriMonth),
    1,
  );
  const isCurrentMonthAndYear =
    calendarMonth.hm === currentHijriDate.hm && currentHijriDate.hy === calendarMonth.hy;
  const localizedMonth = `${t(`islamic-months.${monthWeeks[0].hijriMonth}`)}`;

  return (
    <div className={styles.container}>
      <div className={styles.monthHeader}>{localizedMonth}</div>
      {monthWeeks.map((week, index) => {
        const weekNumber = index + 1;
        const { ranges } = week;
        return (
          <QuranicCalendarWeek
            key={ranges}
            isCurrentWeek={isCurrentMonthAndYear && currentHijriWeekOfMonth === weekNumber}
            weekNumber={weekNumber}
            monthOrder={monthOrder}
            localizedMonth={localizedMonth}
            ranges={ranges}
          />
        );
      })}
    </div>
  );
};

export default QuranicCalendarMonth;
