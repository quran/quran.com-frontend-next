import useSWR from 'swr';

import useIsLoggedIn from './auth/useIsLoggedIn';

import { getReadingGoalStatus } from '@/utils/auth/api';
import { makeReadingGoalStatusUrl } from '@/utils/auth/apiPaths';
import { GoalCategory } from 'types/auth/Goal';

const useRamadanChallengeStatus = () => {
  const { isLoggedIn } = useIsLoggedIn();
  const { data, mutate, isValidating } = useSWR(
    isLoggedIn ? makeReadingGoalStatusUrl({ type: GoalCategory.RAMADAN_CHALLENGE }) : null,
    () => getReadingGoalStatus(GoalCategory.RAMADAN_CHALLENGE),
  );

  return {
    isEnrolled: !!data?.data?.isEnrolled,
    isLoading: isValidating || (!data && isLoggedIn),
    mutate,
  };
};

export default useRamadanChallengeStatus;
