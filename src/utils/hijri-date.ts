/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-func/max-lines-per-function */
import umalqura from '@umalqura/core';
import groupBy from 'lodash/groupBy';

import QuranicCalendarMonthData from '@/components/QuranicCalendar/types/QuranicCalendarMonthData';
import monthsMap from '@/data/quranic-calendar.json';

type Month = {
  year: number;
  month: number;
  day: number;
};

// Constants for better readability
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// Weeks in quranic-calendar.json are already anchored to start on Friday per the Google Sheet,
// so we don't need to shift them in code. Set to 0 to keep anchors as-is.
const WEEK_SHIFT_DAYS = 0;

// Pre-compute all UTC timestamps for better performance
const weekUTCCache = new Map<string, { startTimestamp: number; endTimestamp: number }>();

// Initialize cache (only stores first occurrence of each week number to preserve original behavior)
for (const weeks of Object.values(monthsMap)) {
  for (const week of weeks) {
    // Only cache if this week number hasn't been seen before
    if (!weekUTCCache.has(week.weekNumber)) {
      const startTimestamp = Date.UTC(Number(week.year), Number(week.month) - 1, Number(week.day));
      // Shift the start date by WEEK_SHIFT_DAYS to make it start from Friday
      const shiftedStartTimestamp = startTimestamp + WEEK_SHIFT_DAYS * ONE_DAY_MS;
      // Add 7 days to get the end of the week (exclusive end range for 7-day weeks)
      const endTimestamp = shiftedStartTimestamp + 7 * ONE_DAY_MS;

      weekUTCCache.set(week.weekNumber, { startTimestamp: shiftedStartTimestamp, endTimestamp });
    }
  }
}

/**
 * The idea is to sum the number of weeks from the start of the Quranic
 * calendar to the current week. This is done by summing the number of weeks
 * in each month before the current month and then adding the current week
 * in the current month.
 *
 * @param {umalqura.UmAlQura} currentHijriDate
 * @returns {number}
 */
export const getCurrentQuranicCalendarWeek = (currentHijriDate: umalqura.UmAlQura): number => {
  // Today's date - use UTC to avoid timezone issues
  const today = currentHijriDate.date;
  // IMPORTANT: Use UTC date components to avoid timezone mismatches
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  // Look up from cache - use for...of with Array.from to allow early return
  for (const [weekNumber, cache] of Array.from(weekUTCCache.entries())) {
    if (todayUTC >= cache.startTimestamp && todayUTC < cache.endTimestamp) {
      return Number(weekNumber);
    }
  }

  return 0;
};

// TODO: add unit tests
export const generateWeeksOfMonths = (
  months: Month[],
): {
  monthsDataMap: { [key: string]: QuranicCalendarMonthData };
  currentMonthIndex: number;
} => {
  const today = umalqura();
  const monthsDataMap = {} as {
    [key: string]: QuranicCalendarMonthData;
  };
  let currentMonthIndex;

  // 1. loop through each first day of each month
  for (let i = 0; i < months.length; i += 1) {
    const firstDayOfHijriMonth = umalqura(months[i].year, months[i].month, months[i].day);
    const monthYearKey = `${firstDayOfHijriMonth.hy}-${firstDayOfHijriMonth.hm}`;
    // 2. initialize current month details
    // @ts-ignore
    monthsDataMap[monthYearKey] = {};
    // @ts-ignore
    monthsDataMap[monthYearKey].weeks = {};
    // @ts-ignore
    monthsDataMap[monthYearKey].firstDateOfMonth = firstDayOfHijriMonth.date;
    // filter null days (days before or after start of month) and also filter days before the first day of the month if we are not starting from the first day of the month exactly
    const daysInMonth = firstDayOfHijriMonth.monthArray
      .flat()
      .filter((day) => day !== null && day.isSameOrAfter(firstDayOfHijriMonth));
    /**
     * 3. group days by week of the month. Since 0 dayOfWeek starts is
     * Monday, we are modifying weekOfYear to start on Friday
     */
    const weeksOfMonthDaysMap = groupBy(daysInMonth, (day) => {
      const shiftedDayOfWeek = (day.dayOfWeek + 2) % 7;
      const shiftedWeekOfYear = day.weekOfYear + (shiftedDayOfWeek < day.dayOfWeek ? 1 : 0);
      return `${day.hy}-${shiftedWeekOfYear}`;
    });
    // 4. if the month is the current month, set the current month flag
    const isCurrentMonth = today.hy === months[i].year && today.hm === months[i].month;
    // @ts-ignore
    monthsDataMap[monthYearKey].isCurrentMonth = isCurrentMonth;
    // 5. save the index of the current month so we can automatically scroll to later
    if (isCurrentMonth) {
      currentMonthIndex = i;
    }

    Object.keys(weeksOfMonthDaysMap).forEach((weekKey) => {
      const weekDays = weeksOfMonthDaysMap[weekKey];
      // @ts-ignore
      monthsDataMap[monthYearKey].weeks[weekKey] = {
        weekDays,
        isCurrentWeek: isCurrentMonth && weekDays[0].weekOfYear === today.weekOfYear,
      };
    });
  }

  return { monthsDataMap, currentMonthIndex };
};
