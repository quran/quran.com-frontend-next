import useSWR from 'swr';

import { getReadingDay } from '@/utils/auth/api';
import { makeReadingDaysUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getTimezone } from '@/utils/datetime';

const useGetTodaysReadingDay = () => {
  const {
    data: readingDay,
    isValidating,
    error,
  } = useSWR(isLoggedIn() ? makeReadingDaysUrl(getTimezone()) : null, () =>
    getReadingDay(getTimezone()),
  );

  return {
    readingDay,
    isLoading: isValidating || !readingDay,
    error,
  };
};

export default useGetTodaysReadingDay;
