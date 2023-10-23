import useSWR from 'swr';

import { getUserFeatureFlags } from '@/utils/auth/api';
import { makeUserFeatureFlagsUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const useGetUserFeatureFlags = (flag: string) => {
  const { data, isValidating, error } = useSWR(
    isLoggedIn() ? makeUserFeatureFlagsUrl() : null,
    getUserFeatureFlags,
  );

  const isLoading = isValidating && !data;

  return {
    isEnabled: isLoggedIn() && !isLoading && !error && data?.[flag],
    isLoading,
    error,
  };
};

export default useGetUserFeatureFlags;
