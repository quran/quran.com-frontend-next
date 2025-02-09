import useSWR from 'swr';

import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const useCurrentUser = () => {
  const isUserLoggedIn = isLoggedIn();
  const {
    data: userData,
    isValidating,
    error,
  } = useSWR(isUserLoggedIn ? makeUserProfileUrl() : null, getUserProfile);

  return {
    user: userData || ({} as typeof userData),
    isLoading: isValidating && !userData,
    error,
    isUserLoggedIn,
  };
};

export default useCurrentUser;
