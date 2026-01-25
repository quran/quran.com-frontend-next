import useSWR from 'swr';

import { getReadingGoalStatus } from '@/utils/auth/api';
import { makeReadingGoalStatusUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { GoalCategory } from 'types/auth/Goal';

const useRamadanChallengeStatus = () => {
  const { data, mutate, isValidating } = useSWR(
    isLoggedIn() ? makeReadingGoalStatusUrl({ type: GoalCategory.RAMADAN_CHALLENGE }) : null,
    () => getReadingGoalStatus(GoalCategory.RAMADAN_CHALLENGE),
  );

  return {
    isEnrolled: !!data?.data?.isEnrolled,
    isLoading: isValidating,
    mutate,
  };
};

export default useRamadanChallengeStatus;
