import useSWR from 'swr/immutable';

import UserProgramResponse from '@/types/auth/UserProgramResponse';
import { getUserPrograms } from '@/utils/auth/api';
import { makeGetUserQuranProgramUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

interface UseUserSubscriptionProps {
  programId: string;
}

interface Return {
  isSubscribed: boolean;
  subscriptionData: UserProgramResponse;
  isLoading: boolean;
  error: any;
  mutate: () => Promise<any>;
}

/**
 * Hook to check if user is subscribed to a specific program
 *
 * @returns {Return} An object containing subscription status, data, loading state, and error
 */
const useGetUserQuranProgramEnrollment = ({ programId }: UseUserSubscriptionProps): Return => {
  const { data, error, isValidating, mutate } = useSWR(
    isLoggedIn() && programId ? makeGetUserQuranProgramUrl(programId) : null,
    () => getUserPrograms({ programId }),
  );

  return {
    isSubscribed: !!data?.data?.isSubscribed,
    subscriptionData: data?.data,
    isLoading: isValidating && !data,
    error,
    mutate,
  };
};

export default useGetUserQuranProgramEnrollment;
