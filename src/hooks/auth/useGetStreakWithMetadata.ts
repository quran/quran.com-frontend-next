/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';
import useSWR from 'swr';

import { selectQuranFont, selectQuranMushafLines } from '@/redux/slices/QuranReader/styles';
import { ActivityDay, CurrentQuranActivityDay, QuranActivityDay } from '@/types/auth/ActivityDay';
import { StreakType, StreakWithMetadataParams } from '@/types/auth/Streak';
import { getMushafId } from '@/utils/api';
import { getStreakWithUserMetadata } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { dateToDateString, getFullDayName } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';

type Day = { current: boolean; dateString: string; date: Date };

const useGetWeekDays = () => {
  return useMemo(() => {
    const days: Day[] = [];
    const today = new Date();

    // we want to timeline to start from Sunday
    const sunday = new Date(today);
    if (today.getDay() !== 0) {
      sunday.setDate(today.getDate() - today.getDay());
    }

    for (let i = 0; i < 7; i += 1) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);

      days.push({
        current: day.getDate() === today.getDate(),
        date: day,
        dateString: dateToDateString(day),
      });
    }

    return days;
  }, []);
};

const useGetWeekDayNames = (week: Day[], streak: number, showWeekdayName = false) => {
  const { t, lang } = useTranslation('reading-goal');

  return useMemo(() => {
    const names: { localizedNumber: string; title: string }[] = [];

    let showIncrement = streak > 1;
    let currentDayIndex = 0;
    if (!showWeekdayName && showIncrement) {
      week.forEach((day, index) => {
        /**
         * we need to make sure that the streak is bigger than
         * the current day's number.
         *
         * Example:
         * Streak: 3
         * Timeline:
         * 1  2  3  4  (5 <- current day)  6  7
         *
         * In this case, we don't want to show the increment and start counting days from 1
         */
        if (day.current) {
          showIncrement = streak > index + 1;
          currentDayIndex = index;
        }
      });
    }

    for (let i = 0; i < 7; i += 1) {
      let dayName: { localizedNumber: string; title: string };
      if (showWeekdayName) {
        dayName = {
          localizedNumber: toLocalizedNumber(i + 1, lang),
          title: getFullDayName(week[i].date, lang),
        };
      } else {
        /**
         * If we're showing the increment, we need to subtract all days from the beginning of the week till the current day, and after that increment it based on the day's index.
         *
         * Example:
         * Streak: 10
         * Timeline:
         * 1  (2 <- current day)  3  4  5  6  7
         *
         * We need to render "1" as Day 9, and "2" as Day 10.
         * "1" -> i = 0; currentDayIndex = 1; streak = 10; 10 - 1 + 0 = 9
         * "2" -> i = 1; currentDayIndex = 1; streak = 10; 10 - 1 + 1 = 10
         *
         */
        const localizedNumber = toLocalizedNumber(
          showIncrement ? streak - currentDayIndex + i : i + 1,
          lang,
        );

        dayName = {
          localizedNumber,
          title: t('day-x', {
            day: localizedNumber,
          }),
        };
      }

      names.push(dayName);
    }

    return names;
  }, [lang, showWeekdayName, streak, t, week]);
};

const useGetStreakWithMetadata = ({
  showDayName,
  disableIfNoGoalExists,
}: {
  showDayName?: boolean;
  disableIfNoGoalExists?: boolean;
} = {}) => {
  const week = useGetWeekDays();
  const quranFont = useSelector(selectQuranFont, shallowEqual);
  const mushafLines = useSelector(selectQuranMushafLines, shallowEqual);
  const { mushaf } = getMushafId(quranFont, mushafLines);

  const [disabled, setDisabled] = useState<boolean | null>(null);

  const params: StreakWithMetadataParams = {
    mushafId: mushaf,
    from: week[0].dateString,
    to: week[week.length - 1].dateString,
    type: StreakType.QURAN,
  };

  // we don't pass the params to `makeStreakUrl` in the key so that we can invalidate the cache without getting the other params
  const { data, isValidating, error } = useSWR(
    isLoggedIn() && disabled !== true ? makeStreakUrl() : null,
    () => getStreakWithUserMetadata(params),
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (disabled !== null || !disableIfNoGoalExists || !data) {
      return;
    }

    /**
     * We don't want to re-fetch the data if the user has no goal.
     * This is useful for the quran reader widget when we invalidate the cache after the user has read something.
     */
    setDisabled(!data.data.goal);
  }, [disableIfNoGoalExists, disabled, data]);

  const isLoading = isValidating && !data;

  const { activityDays, goal, streak } = data?.data || {
    activityDays: [],
    goal: undefined,
    streak: 0,
  };

  const readingDaysMap = useMemo<
    Record<string, ActivityDay<QuranActivityDay> & { hasRead: boolean }>
  >(() => {
    if (!activityDays) return {};

    const result = {};

    activityDays.forEach((day) => {
      result[day.date] = {
        ...day,
        hasRead:
          day.pagesRead > 0 ||
          day.secondsRead > 0 ||
          day.ranges.length > 0 ||
          day.manuallyAddedSeconds > 0,
      };
    });

    return result;
  }, [activityDays]);

  const currentActivityDay: CurrentQuranActivityDay | undefined = useMemo(() => {
    return readingDaysMap[week.find((d) => d.current)?.dateString];
  }, [readingDaysMap, week]);

  const weekDayNames = useGetWeekDayNames(week, streak, showDayName);
  const weekData = useMemo(() => {
    return {
      days: week.map((day, idx) => ({
        ...day,
        info: weekDayNames[idx],
      })),
      readingDaysMap,
    };
  }, [week, weekDayNames, readingDaysMap]);

  return {
    isLoading,
    error,
    weekData,
    streak,
    goal,
    activityDays,
    currentActivityDay,
  };
};

export type StreakWithMetadata = ReturnType<typeof useGetStreakWithMetadata>;

export default useGetStreakWithMetadata;
