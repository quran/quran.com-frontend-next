import useSWR from 'swr';

import { getUserFeatureFlags } from '@/utils/auth/api';
import { makeUserFeatureFlagsUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const useGetUserFeatureFlags = () => {
  const { data, isValidating, error } = useSWR(
    isLoggedIn() ? makeUserFeatureFlagsUrl() : null,
    getUserFeatureFlags,
  );

  return {
    data,
    isLoading: isValidating && !data,
    error,
  };
};

export default useGetUserFeatureFlags;
