import { getCurrentMonth, makeDateRangeFromMonth } from './datetime';

import { ActivityDayType, FilterActivityDaysParams } from '@/types/auth/ActivityDay';

export const getFilterActivityDaysParamsOfCurrentMonth = (): FilterActivityDaysParams => {
  const currentMonth = getCurrentMonth();
  const currentYear = new Date().getFullYear();

  return getFilterActivityDaysParams(currentMonth, currentYear);
};

export const getFilterActivityDaysParams = (
  month: number,
  year: number,
): FilterActivityDaysParams => {
  const { from, to } = makeDateRangeFromMonth(month, year);

  const params: FilterActivityDaysParams = {
    from,
    to,
    limit: 31,
    type: ActivityDayType.QURAN,
  };

  return params;
};
