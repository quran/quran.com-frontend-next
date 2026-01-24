import useSWR from 'swr';

import { getRamadanChallengeStatus } from '@/utils/auth/api';
import { makeRamadanChallengeStatusUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const useRamadanChallengeStatus = () => {
  const { data, mutate, isValidating } = useSWR(
    isLoggedIn() ? makeRamadanChallengeStatusUrl() : null,
    getRamadanChallengeStatus,
  );

  return {
    isEnrolled: data?.data?.isEnrolled,
    isLoading: isValidating,
    mutate,
  };
};

export default useRamadanChallengeStatus;
