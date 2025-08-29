import { useEffect } from 'react';

import useSWRImmutable from 'swr/immutable';

import { useAuth, AuthState } from '@/contexts/AuthContext';
import { logErrorToSentry } from '@/lib/sentry';
import UserProfile from '@/types/auth/UserProfile';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

interface UseAuthDataReturn extends AuthState {
  userData: UserProfile | undefined;
  isUserDataLoading: boolean;
  userDataError: any;
}

/**
 * Custom hook that integrates SWR data fetching with AuthContext
 * Automatically updates auth state when user data is fetched
 * @returns {UseAuthDataReturn} Auth data and state
 */
function useAuthData(): UseAuthDataReturn {
  const { state, dispatch } = useAuth();
  const isLoggedInUser = isLoggedIn();

  const {
    data: userData,
    isValidating: isUserDataLoading,
    error: userDataError,
  } = useSWRImmutable(isLoggedInUser ? makeUserProfileUrl() : null, getUserProfile);

  // Update auth state when data changes
  useEffect(() => {
    if (isUserDataLoading) {
      dispatch({ type: 'SET_LOADING', payload: true });
    } else if (userDataError) {
      logErrorToSentry(userDataError, {
        transactionName: 'useAuthData',
        metadata: { userDataError },
      });
      dispatch({
        type: 'SET_ERROR',
        payload: userDataError.message || 'Failed to fetch user data',
      });
    } else if (userData) {
      dispatch({ type: 'SET_USER', payload: userData });
    } else if (!isLoggedInUser) {
      // User is not logged in - clear any existing state
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_USER', payload: null });
    }
  }, [userData, isUserDataLoading, userDataError, isLoggedInUser, dispatch]);

  return {
    userData,
    isUserDataLoading,
    userDataError,
    // Re-export auth state for convenience
    ...state,
  };
}

export default useAuthData;
