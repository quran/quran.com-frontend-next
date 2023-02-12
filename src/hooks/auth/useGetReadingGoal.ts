import useSWR from 'swr';

import { getReadingGoal } from '@/utils/auth/api';
import { makeReadingGoalUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const useGetReadingGoal = () => {
  const {
    data: readingGoal,
    isValidating,
    error,
  } = useSWR(isLoggedIn() ? makeReadingGoalUrl() : null, getReadingGoal);

  return {
    readingGoal,
    isLoading: isValidating && !readingGoal,
    error,
  };
};

export default useGetReadingGoal;
