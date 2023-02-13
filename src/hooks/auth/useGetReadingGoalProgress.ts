import useSWR from 'swr';

import { getReadingGoalProgress } from '@/utils/auth/api';
import { makeReadingGoalProgressUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getTimezone } from '@/utils/datetime';

const useGetReadingGoalProgress = () => {
  const {
    data: readingGoalProgress,
    isValidating,
    error,
  } = useSWR(isLoggedIn() ? makeReadingGoalProgressUrl(getTimezone()) : null, () =>
    getReadingGoalProgress(getTimezone()),
  );

  return {
    readingGoalProgress,
    isLoading: isValidating && !readingGoalProgress,
    error,
  };
};

export default useGetReadingGoalProgress;
