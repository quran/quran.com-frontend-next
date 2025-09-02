import useSWRImmutable from 'swr/immutable';

import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

/**
 * Hook for fetching user profile data with SWR
 * Handles the data fetching logic separately from context synchronization
 * @returns {object} SWR response with user profile data
 */
const useUserProfile = () => {
  const isLoggedInUser = isLoggedIn();

  // Only fetch if user is logged in and we have the necessary functions
  const shouldFetch =
    isLoggedInUser &&
    typeof makeUserProfileUrl === 'function' &&
    typeof getUserProfile === 'function';

  return useSWRImmutable(shouldFetch ? makeUserProfileUrl() : null, getUserProfile, {
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    // Add error retry configuration
    errorRetryCount: 3,
    errorRetryInterval: 1000,
  });
};

export default useUserProfile;
