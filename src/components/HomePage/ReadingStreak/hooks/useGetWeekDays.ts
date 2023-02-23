import { useMemo } from 'react';

import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';

import useGetAllReadingDays from '@/hooks/auth/useGetAllReadingDays';
import { ReadingDay } from '@/types/auth/ReadingDay';
import { dateToDateString } from '@/utils/datetime';

const getDaysOfWeek = (t: Translate) => [
  t('week.saturday'),
  t('week.sunday'),
  t('week.monday'),
  t('week.tuesday'),
  t('week.wednesday'),
  t('week.thursday'),
  t('week.friday'),
];

const useGetWeekDays = () => {
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

  const { readingDays, isLoading } = useGetAllReadingDays(
    weekDays[0].date,
    weekDays[weekDays.length - 1].date,
  );

  const readingDaysMap = useMemo<Record<string, ReadingDay & { hasRead: boolean }>>(() => {
    if (!readingDays?.data) return {};

    const data = {};

    readingDays.data.forEach((day) => {
      // we know this is a string because we parse it on the server
      data[day.date as unknown as string] = {
        ...day,
        hasRead: day.pagesRead > 0 || day.secondsRead > 0 || day.ranges.length > 0,
      };
    });

    return data;
  }, [readingDays]);

  return {
    isLoading,
    weekDays,
    readingDaysMap,
  };
};

export default useGetWeekDays;
