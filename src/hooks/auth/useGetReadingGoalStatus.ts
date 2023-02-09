import useSWR from 'swr';

import { getReadingGoalStatus } from '@/utils/auth/api';
import { makeReadingGoalStatusUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const useGetReadingGoalStatus = () => {
  const {
    data: readingGoalStatus,
    isValidating,
    error,
  } = useSWR(isLoggedIn() ? makeReadingGoalStatusUrl() : null, getReadingGoalStatus);

  return {
    readingGoalStatus,
    isLoading: isValidating || !readingGoalStatus,
    error,
  };
};

export default useGetReadingGoalStatus;
