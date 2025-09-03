import { useEffect } from 'react';

import useSWR from 'swr';

import useIsLoggedIn from './useIsLoggedIn';

import { useAuthContext } from '@/contexts/AuthContext';
import { logErrorToSentry } from '@/lib/sentry';
import { AuthState } from '@/types/auth/AuthState';
import { AuthError } from '@/types/auth/errorTypes';
import UserProfile from '@/types/auth/UserProfile';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { classifyError } from '@/utils/auth/errors';

export interface UseAuthDataReturn extends AuthState {
  /** User profile data (when available) */
  userData?: UserProfile;
  /** Error from data fetching (if any) */
  userDataError: AuthError;
  /** Function to refresh user data */
  refreshUserData: () => Promise<UserProfile | null>;
}

/**
 * Authentication data hook with SWR integration
 * Provides authentication state and user data management
 * @returns {UseAuthDataReturn} Authentication data and state
 */
const useAuthData = (): UseAuthDataReturn => {
  const { state, dispatch } = useAuthContext();
  const { isLoggedIn: isLoggedInUser } = useIsLoggedIn();

  const swrKey = isLoggedInUser ? makeUserProfileUrl() : null;
  const shouldRetryOnError = (error: any) => {
    // Do not retry on 401 Unauthorized errors
    if (error?.status === 401 || error?.response?.status === 401) return false;
    return true;
  };

  const {
    data: userData,
    isValidating: isUserDataLoading,
    error: userDataError,
    mutate: refreshUserData,
  } = useSWR(swrKey, getUserProfile, {
    shouldRetryOnError,
  });

  // Keep isAuthenticated in sync with the login cookie
  useEffect(() => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: isLoggedInUser });
  }, [isLoggedInUser, dispatch]);

  // Sync SWR data with auth context
  useEffect(() => {
    // Early return: If user data is loading, set loading state
    if (isUserDataLoading && !userData) {
      dispatch({ type: 'SET_LOADING', payload: true });
      return;
    }

    if (userDataError) {
      const authError = classifyError(userDataError, {
        transactionName: 'useAuthData',
        userDataError,
      });

      logErrorToSentry(userDataError, {
        transactionName: 'useAuthData',
        metadata: { userDataError },
      });

      // If unauthorized, mark as unauthenticated and clear user to prevent stale state
      if (authError.type === 'unauthorized') {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }

      dispatch({ type: 'SET_ERROR', payload: authError });
      return;
    }

    // Early return: Handle successful user data fetch
    if (userData) {
      dispatch({ type: 'SET_USER', payload: userData });
    }
  }, [userData, isUserDataLoading, userDataError, dispatch, state.user, isLoggedInUser]);

  return {
    ...state,
    userData,
    userDataError,
    refreshUserData,
  };
};

export default useAuthData;
