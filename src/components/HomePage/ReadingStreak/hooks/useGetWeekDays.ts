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

const useGetWeekDays = (enable = true) => {
  const { t } = useTranslation('reading-goal');

  // TODO: check the user's activty on each day
  const weekDays = useMemo(() => {
    const daysOfWeek = getDaysOfWeek(t);
    const days = [];
    const today = new Date();

    const saturday = new Date(today);
    // get the saturday exactly before today (or today if today is saturday)
    saturday.setDate(today.getDate() - today.getDay() - 1);

    const friday = new Date(saturday);
    friday.setDate(saturday.getDate() + 5);

    for (let i = 0; i < 7; i += 1) {
      const day = new Date(saturday);
      day.setDate(saturday.getDate() + i);
      days.push({
        name: daysOfWeek[i],
        current: day.getDate() === today.getDate(),
        date: dateToDateString(day),
      });
    }

    return days;
  }, [t]);

  const { readingDays, isLoading } = useGetAllReadingDays(
    weekDays[0].date,
    weekDays[weekDays.length - 1].date,
    enable,
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
