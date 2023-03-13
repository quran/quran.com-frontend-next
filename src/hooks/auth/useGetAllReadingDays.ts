import useSWR from 'swr';

import { getAllReadingDays } from '@/utils/auth/api';
import { makeAllReadingDaysUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const useGetAllReadingDays = (from: string, to: string, enable = true) => {
  const {
    data: readingDays,
    isValidating,
    error,
  } = useSWR(isLoggedIn() && enable ? makeAllReadingDaysUrl(from, to) : null, () =>
    getAllReadingDays(from, to),
  );

  return {
    readingDays,
    isLoading: isValidating || !readingDays,
    error,
  };
};

export default useGetAllReadingDays;
