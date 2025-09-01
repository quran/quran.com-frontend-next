import { useEffect } from 'react';

import useSWRImmutable from 'swr/immutable';

import { useAuthContext } from '@/contexts/AuthContext';
import { logErrorToSentry } from '@/lib/sentry';
import { AuthState } from '@/types/auth/AuthState';
import UserProfile from '@/types/auth/UserProfile';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

export interface UseAuthDataReturn extends AuthState {
  /** User profile data (when available) */
  userData?: UserProfile;
  /** Error from data fetching (if any) */
  userDataError?: any;
  /** Function to refresh user data */
  refreshUserData: () => Promise<UserProfile | null>;
}

/**
 * Authentication data hook with SWR integration
 * Provides authentication state and user data management
 * @returns {UseAuthDataReturn} Authentication data and state
 */
export function useAuthData(): UseAuthDataReturn {
  const { state, dispatch } = useAuthContext();
  const isLoggedInUser = isLoggedIn();

  const {
    data: userData,
    isValidating: isUserDataLoading,
    error: userDataError,
    mutate: refreshUserData,
  } = useSWRImmutable(isLoggedInUser ? makeUserProfileUrl() : null, getUserProfile, {
    revalidateOnFocus: false,
    shouldRetryOnError: true,
  });

  // Sync SWR data with auth context
  useEffect(() => {
    if (isUserDataLoading && !userData) {
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
      // User is not logged in - set to idle state
      dispatch({ type: 'SET_LOADING', payload: false });
      if (!state.user) {
        dispatch({ type: 'SET_USER', payload: null });
      }
    }
  }, [userData, isUserDataLoading, userDataError, isLoggedInUser, dispatch, state.user]);

  return {
    ...state,
    userData,
    userDataError,
    refreshUserData,
  };
}

export default useAuthData;
