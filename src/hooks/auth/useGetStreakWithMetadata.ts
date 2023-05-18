import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';
import useSWR from 'swr';

import { selectQuranFont, selectQuranMushafLines } from '@/redux/slices/QuranReader/styles';
import { ActivityDay } from '@/types/auth/ActivityDay';
import { StreakWithMetadataParams } from '@/types/auth/Streak';
import { getMushafId } from '@/utils/api';
import { getStreakWithUserMetadata } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { dateToDateString, getFullDayName } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';

const useGetWeekDays = (showDayName = false) => {
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
        name: showDayName
          ? getFullDayName(day, lang)
          : t('day-x', { day: toLocalizedNumber(i + 1, lang) }),
        current: day.getDate() === today.getDate(),
        date: dateToDateString(day),
      });
    }

    return days;
  }, [t, lang, showDayName]);
};

const useGetStreakWithMetadata = ({
  showDayName,
}: {
  showDayName?: boolean;
} = {}) => {
  const week = useGetWeekDays(showDayName);
  const quranFont = useSelector(selectQuranFont, shallowEqual);
  const mushafLines = useSelector(selectQuranMushafLines, shallowEqual);
  const { mushaf } = getMushafId(quranFont, mushafLines);

  const params: StreakWithMetadataParams = {
    mushafId: mushaf,
    from: week[0].date,
    to: week[week.length - 1].date,
  };

  // we don't pass the params to `makeStreakUrl` in the key so that we can invalidate the cache without getting the other params
  const { data, isValidating, error } = useSWR(
    isLoggedIn() ? makeStreakUrl() : null,
    () => getStreakWithUserMetadata(params),
    {
      revalidateOnFocus: false,
    },
  );

  const isLoading = isValidating && !data;

  const { activityDays, goal, streak } = data?.data || {
    activityDays: [],
    goal: undefined,
    streak: 0,
  };

  const readingDaysMap = useMemo<Record<string, ActivityDay & { hasRead: boolean }>>(() => {
    if (!activityDays) return {};

    const result = {};

    activityDays.forEach((day) => {
      result[day.date] = {
        ...day,
        hasRead: day.pagesRead > 0 || day.secondsRead > 0 || day.ranges.length > 0,
      };
    });

    return result;
  }, [activityDays]);

  const currentActivityDay = useMemo(() => {
    return readingDaysMap[week.find((d) => d.current)?.date];
  }, [readingDaysMap, week]);

  return {
    isLoading,
    error,
    weekData: {
      days: week,
      readingDaysMap,
    },
    streak,
    goal,
    activityDays,
    currentActivityDay,
  };
};

export type StreakWithMetadata = ReturnType<typeof useGetStreakWithMetadata>;

export default useGetStreakWithMetadata;
