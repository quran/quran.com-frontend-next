import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import { ReadingDay } from '@/types/auth/ReadingDay';
import { StreakWithMetadataParams } from '@/types/auth/Streak';
import { getStreakWithUserMetadata } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getTimezone, dateToDateString } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';

const useGetWeekDays = () => {
  const { t, lang } = useTranslation('reading-goal');

  return useMemo(() => {
    const days: { name: string; current: boolean; date: string }[] = [];
    const today = new Date();

    const saturday = new Date(today);

    if (today.getDay() !== 6) {
      saturday.setDate(today.getDate() - today.getDay() - 1);
    }

    const friday = new Date(saturday);
    friday.setDate(saturday.getDate() + 5);

    for (let i = 0; i < 7; i += 1) {
      const day = new Date(saturday);
      day.setDate(saturday.getDate() + i);
      days.push({
        name: t('day-x', { day: toLocalizedNumber(i + 1, lang) }),
        current: day.getDate() === today.getDate(),
        date: dateToDateString(day),
      });
    }

    return days;
  }, [t, lang]);
};

const useGetStreakWithMetadata = () => {
  const week = useGetWeekDays();

  const params: StreakWithMetadataParams = {
    timezone: getTimezone(),
    from: week[0].date,
    to: week[week.length - 1].date,
  };

  // we don't pass the params to `makeStreakUrl` in the key so that we can invalidate the cache without getting the other params
  const { data, isValidating, error } = useSWRImmutable(isLoggedIn() ? makeStreakUrl() : null, () =>
    getStreakWithUserMetadata(params),
  );

  const isLoading = isValidating && !data;

  const { readingDays, readingGoal, streak } = data?.data || {
    readingDays: [],
    readingGoal: undefined,
    streak: 0,
  };

  const readingDaysMap = useMemo<Record<string, ReadingDay & { hasRead: boolean }>>(() => {
    if (!readingDays) return {};

    const result = {};

    readingDays.forEach((day) => {
      result[day.date] = {
        ...day,
        hasRead: day.pagesRead > 0 || day.secondsRead > 0 || day.ranges.length > 0,
      };
    });

    return result;
  }, [readingDays]);

  return {
    isLoading,
    error,
    weekData: {
      days: week,
      readingDaysMap,
    },
    streak,
    readingGoal,
    readingDays,
  };
};

export default useGetStreakWithMetadata;
