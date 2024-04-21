import { useMemo } from 'react';

import ReadingStats from './ReadingStats';

import Calendar from '@/dls/Calendar';
import { QuranActivityDay, ActivityDay } from '@/types/auth/ActivityDay';
import { logButtonClick } from '@/utils/eventLogger';

interface DaysCalendarProps {
  month: { id: number; name: string; daysCount: number };
  year: number;
  days: ActivityDay<QuranActivityDay>[];
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  isLoading?: boolean;
}

const DaysCalendar: React.FC<DaysCalendarProps> = ({
  month,
  year,
  days,
  selectedDate,
  setSelectedDate,
  isLoading,
}) => {
  const dateToDayMap = useMemo(() => {
    const map: Record<string, ActivityDay<QuranActivityDay>> = {};

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
    return <ReadingStats activityDay={readingDay} />;
  }

  const onDayClick = (dayNumber: number, dateString: string) => {
    logButtonClick('reading_history_day', {
      month: month.id,
      year,
      day: dayNumber,
    });
    setSelectedDate(dateString);
  };

  return (
    <Calendar
      year={year}
      isLoading={isLoading}
      month={month.id as any}
      onDayClick={onDayClick}
      getIsDayDisabled={(day, dateString) => {
        const dayData = dateToDayMap[dateString];
        return !dayData;
      }}
    />
  );
};

export default DaysCalendar;
