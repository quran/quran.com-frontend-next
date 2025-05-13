import { useCallback, useMemo, useState } from 'react';

import umalqura from '@umalqura/core';
import useTranslation from 'next-translate/useTranslation';

import { CalendarData, ProcessedMonth } from './types';

import monthsMap from '@/data/quranic-calendar.json';
import useGetUserQuranProgramEnrollment from '@/hooks/auth/useGetUserQuranProgramEnrollment';
import { QURANIC_CALENDAR_PROGRAM_ID } from '@/utils/auth/constants';
import { getCurrentQuranicCalendarWeek } from '@/utils/hijri-date';

/**
 * Custom hook to process and manage Quranic calendar months data
 * @returns {object} An object containing month data, current month index and setter
 */
const useMonthsData = () => {
  const { t } = useTranslation('quranic-calendar');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Get user enrollment data to check completed weeks
  const { subscriptionData } = useGetUserQuranProgramEnrollment({
    programId: QURANIC_CALENDAR_PROGRAM_ID,
  });

  // Get current week for determining if weeks have passed
  const currentHijriDate = umalqura();
  const currentWeek = getCurrentQuranicCalendarWeek(currentHijriDate);
  const currentHijriMonth = currentHijriDate.hm;

  // Process weeks for a single month
  const processWeeks = useCallback(
    (monthData) => {
      return monthData.map((week, index) => {
        const weekNumber = parseInt(week.weekNumber, 10);
        return {
          localWeekNumber: index + 1,
          globalWeekNumber: weekNumber,
          isCompleted: subscriptionData?.completedWeeks?.includes(weekNumber),
          isActive: weekNumber === currentWeek,
          hasPassed: weekNumber < currentWeek,
          data: week,
        };
      });
    },
    [currentWeek, subscriptionData],
  );

  // Process months from the JSON data
  const processMonthsFromData = useCallback(
    (data) => {
      const monthKeys = Object.keys(data).sort();
      const months: ProcessedMonth[] = [];
      const processedMonths = new Set();

      // Process all months from the JSON file
      monthKeys.forEach((key) => {
        const [, monthNum] = key.split('-');
        if (monthNum && !processedMonths.has(monthNum)) {
          processedMonths.add(monthNum);
          months.push({
            id: parseInt(monthNum, 10),
            name: t(`islamic-months.${monthNum}`),
            weeks: processWeeks(data[key]),
            isRamadan: false,
            isCurrentMonth: parseInt(monthNum, 10) === currentHijriMonth,
          });
        }
      });

      // Add Ramadan as the final month
      months.push({
        id: 9,
        name: t('islamic-months.9'),
        weeks: [],
        isRamadan: true,
        isCurrentMonth: currentHijriMonth === 9,
      });

      return months;
    },
    [currentHijriMonth, processWeeks, t],
  );

  // Create carousel slides and month rows
  const { monthRows, monthSlides, months } = useMemo(() => {
    const data = monthsMap as CalendarData;
    const processedMonths = processMonthsFromData(data);

    // Find the index of the current month for initial carousel position
    const currentMonthIdx = processedMonths.findIndex((month) => month.isCurrentMonth);
    if (currentMonthIdx !== -1) {
      setCurrentMonthIndex(currentMonthIdx);
    }

    // Create rows of 3 months each for desktop view
    const rows = [];
    for (let i = 0; i < processedMonths.length; i += 3) {
      rows.push(processedMonths.slice(i, i + 3));
    }

    // Create slides for mobile carousel view
    const slides = processedMonths.map((month) => ({
      id: `month-${month.id}`,
      month,
    }));

    return {
      monthRows: rows,
      monthSlides: slides,
      months: processedMonths,
    };
  }, [processMonthsFromData]);

  return {
    monthRows,
    monthSlides,
    months,
    currentMonthIndex,
    setCurrentMonthIndex,
  };
};

export default useMonthsData;
