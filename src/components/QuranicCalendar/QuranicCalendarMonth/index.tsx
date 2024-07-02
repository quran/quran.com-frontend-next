import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './QuranicCalendarMonth.module.scss';

import QuranicCalendarMonthData from '@/components/QuranicCalendar/types/QuranicCalendarMonthData';
import QuranicCalendarWeek from 'src/components/QuranicCalendar/QuranicCalendarWeek';

type Props = {
  monthWeeks: QuranicCalendarMonthData;
  currentQuranicCalendarWeek: number;
};

const QuranicCalendarMonth: React.FC<Props> = ({ monthWeeks, currentQuranicCalendarWeek }) => {
  const { t } = useTranslation('quranic-calendar');
  const localizedMonth = `${t(`islamic-months.${monthWeeks[0].hijriMonth}`)}`;

  return (
    <div className={styles.container}>
      <div className={styles.monthHeader}>{localizedMonth}</div>
      {monthWeeks.map((week) => {
        const { ranges, weekNumber } = week;
        return (
          <QuranicCalendarWeek
            key={ranges}
            isCurrentWeek={currentQuranicCalendarWeek === Number(weekNumber)}
            weekNumber={Number(weekNumber)}
            localizedMonth={localizedMonth}
            ranges={ranges}
          />
        );
      })}
    </div>
  );
};

export default QuranicCalendarMonth;
