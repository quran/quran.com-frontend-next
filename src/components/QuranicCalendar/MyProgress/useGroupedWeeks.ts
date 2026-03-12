import { useMemo } from 'react';

import { HIJRI_MONTH_ORDER, HIJRI_MONTH_ORDER_MAP, WEEK_GROUPS } from './weekProgressConstants';
import { GroupedMonth, WeekData, WeekGroupWithMonths, WeekRow } from './weekProgressTypes';

import calendarData from '@/data/quranic-calendar.json';
import { getChapterData } from '@/utils/chapter';
import { parseVerseRange } from '@/utils/verseKeys';
import ChaptersData from 'types/ChaptersData';

type UseGroupedWeeksOptions = {
  chaptersData: ChaptersData;
  getIslamicMonthName: (month: number) => string;
};

const useGroupedWeeks = ({
  chaptersData,
  getIslamicMonthName,
}: UseGroupedWeeksOptions): WeekGroupWithMonths[] => {
  const allWeeks = useMemo(
    () =>
      Object.values(calendarData as Record<string, WeekData[]>)
        .flat()
        .sort((a, b) => Number(a.weekNumber) - Number(b.weekNumber)),
    [],
  );

  const weekRows = useMemo(
    () =>
      allWeeks.map((week): WeekRow => {
        const parsedRange = parseVerseRange(week.ranges, true);
        const from = parsedRange?.[0];
        const to = parsedRange?.[1];
        const hijriMonth = Number(week.hijriMonth);

        return {
          weekNumber: Number(week.weekNumber),
          hijriMonth,
          monthName: getIslamicMonthName(hijriMonth),
          monthOrder: HIJRI_MONTH_ORDER_MAP.get(hijriMonth) || 0,
          startChapterNumber: from?.chapter || 0,
          startSurahName: from
            ? getChapterData(chaptersData, from.chapter.toString())?.transliteratedName || '-'
            : '-',
          startVerse: from?.verse || 0,
          endChapterNumber: to?.chapter || 0,
          endSurahName: to
            ? getChapterData(chaptersData, to.chapter.toString())?.transliteratedName || '-'
            : '-',
          endVerse: to?.verse || 0,
        };
      }),
    [allWeeks, chaptersData, getIslamicMonthName],
  );

  return useMemo(
    () =>
      WEEK_GROUPS.map((group) => {
        const weeksInGroup = weekRows.filter(
          (week) => week.weekNumber >= group.startWeek && week.weekNumber <= group.endWeek,
        );

        const monthMap = new Map<number, WeekRow[]>();
        weeksInGroup.forEach((week) => {
          if (!monthMap.has(week.hijriMonth)) {
            monthMap.set(week.hijriMonth, []);
          }
          monthMap.get(week.hijriMonth).push(week);
        });

        const months: GroupedMonth[] = HIJRI_MONTH_ORDER.filter((month) => monthMap.has(month)).map(
          (month) => {
            const weeks = monthMap.get(month) || [];
            return {
              monthNumber: month,
              monthName: weeks[0]?.monthName || getIslamicMonthName(month),
              monthOrder: weeks[0]?.monthOrder || HIJRI_MONTH_ORDER_MAP.get(month) || 0,
              weeks,
            };
          },
        );

        return { ...group, months };
      }),
    [getIslamicMonthName, weekRows],
  );
};

export default useGroupedWeeks;
