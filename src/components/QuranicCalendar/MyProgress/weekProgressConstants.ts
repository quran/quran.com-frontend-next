import { WeekGroup } from './weekProgressTypes';

import { toLocalizedNumber } from '@/utils/locale';

export const WEEK_GROUPS: WeekGroup[] = [
  { key: 'weeks-1-9', title: 'Week 1-9', startWeek: 1, endWeek: 9 },
  { key: 'weeks-10-18', title: 'Week 10-18', startWeek: 10, endWeek: 18 },
  { key: 'weeks-19-23', title: 'Week 19-23', startWeek: 19, endWeek: 23 },
  { key: 'weeks-24-29', title: 'Week 24-29', startWeek: 24, endWeek: 29 },
  { key: 'weeks-30-35', title: 'Week 30-35', startWeek: 30, endWeek: 35 },
  { key: 'weeks-36-40', title: 'Week 36-40', startWeek: 36, endWeek: 40 },
  { key: 'weeks-41-46', title: 'Week 41-46', startWeek: 41, endWeek: 46 },
];

export const HIJRI_MONTH_ORDER = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

export const HIJRI_MONTH_ORDER_MAP = new Map(
  HIJRI_MONTH_ORDER.map((month, index) => [month, index + 1]),
);

export const getLocalizedWeekRangeLabel = (
  startWeek: number,
  endWeek: number,
  locale: string,
  weekLabel: string,
): string => {
  const localizedStartWeek = toLocalizedNumber(startWeek, locale);
  const localizedEndWeek = toLocalizedNumber(endWeek, locale);

  return `${weekLabel} <span data-week-range>${localizedStartWeek} - ${localizedEndWeek}</span>`;
};
