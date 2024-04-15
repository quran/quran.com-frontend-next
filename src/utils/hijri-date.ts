/* eslint-disable react-func/max-lines-per-function */
import umalqura from '@umalqura/core';
import groupBy from 'lodash/groupBy';

import QuranicCalendarMonthData from '@/components/QuranicCalendar/types/QuranicCalendarMonthData';
import monthsMap from 'quranic-calendar.json';

type Month = {
  year: number;
  month: number;
  day: number;
};

/**
 * The idea is to sum the number of weeks from the start of the Quranic
 * calendar to the current week. This is done by summing the number of weeks
 * in each month before the current month and then adding the current week
 * in the current mont.
 *
 * @param {umalqura.UmAlQura} currentHijriDate
 * @returns {number}
 */
export const getCurrentQuranicCalendarWeek = (currentHijriDate: umalqura.UmAlQura): number => {
  const currentHijriMonthYear = `${currentHijriDate.hy}-${currentHijriDate.hm}`;
  const currentHijriWeekOfMonth = Math.ceil(currentHijriDate.hd / 7);
  const monthWeeks = Object.values(monthsMap);
  const currentQuranicMonthIndex = Object.keys(monthsMap).findIndex(
    (month) => month === currentHijriMonthYear,
  );
  let currentQuranicCalendarWeek = 0;
  for (let monthIndex = 0; monthIndex < monthWeeks.length; monthIndex += 1) {
    // if we passed the current month, break
    if (monthIndex > currentQuranicMonthIndex) {
      break;
    }
    const currentMonthWeeks = monthWeeks[monthIndex];
    // if the month is before the current month, add the total number of weeks in the month
    if (monthIndex !== currentQuranicMonthIndex) {
      currentQuranicCalendarWeek += currentMonthWeeks.length;
    } else {
      // if the month is the current month, add the current week in the month
      currentQuranicCalendarWeek += currentHijriWeekOfMonth;
    }
  }
  return currentQuranicCalendarWeek;
};

// TODO: add unit tests
export const generateWeeksOfMonths = (
  months: Month[],
): {
  monthsMap: { [key: string]: QuranicCalendarMonthData };
  currentMonthIndex: number;
} => {
  const today = umalqura();
  const monthsMap = {} as {
    [key: string]: QuranicCalendarMonthData;
  };
  let currentMonthIndex;

  // 1. loop through each first day of each month
  for (let i = 0; i < months.length; i += 1) {
    const firstDayOfHijriMonth = umalqura(months[i].year, months[i].month, months[i].day);
    const monthYearKey = `${firstDayOfHijriMonth.hy}-${firstDayOfHijriMonth.hm}`;
    // 2. initialize current month details
    // @ts-ignore
    monthsMap[monthYearKey] = {};
    // @ts-ignore
    monthsMap[monthYearKey].weeks = {};
    // @ts-ignore
    monthsMap[monthYearKey].firstDateOfMonth = firstDayOfHijriMonth.date;
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
    monthsMap[monthYearKey].isCurrentMonth = isCurrentMonth;
    // 5. save the index of the current month so we can automatically scroll to later
    if (isCurrentMonth) {
      currentMonthIndex = i;
    }

    Object.keys(weeksOfMonthDaysMap).forEach((weekKey) => {
      const weekDays = weeksOfMonthDaysMap[weekKey];
      // @ts-ignore
      monthsMap[monthYearKey].weeks[weekKey] = {
        weekDays,
        isCurrentWeek: isCurrentMonth && weekDays[0].weekOfYear === today.weekOfYear,
      };
    });
  }

  return { monthsMap, currentMonthIndex };
};
