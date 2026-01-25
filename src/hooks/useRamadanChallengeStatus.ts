import useSWR from 'swr';

import { getGoalStatus } from '@/utils/auth/api';
import { makeGoalStatusUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { GoalCategory } from 'types/auth/Goal';

const useRamadanChallengeStatus = () => {
  const { data, mutate, isValidating } = useSWR(
    isLoggedIn() ? makeGoalStatusUrl({ type: GoalCategory.RAMADAN_CHALLENGE }) : null,
    () => getGoalStatus(GoalCategory.RAMADAN_CHALLENGE),
  );

  return {
    isEnrolled: !!data,
    isLoading: isValidating,
    mutate,
  };
};

export default useRamadanChallengeStatus;
