import { useContext, useEffect } from 'react';

import useUserProfile from './useUserProfile';

import { AuthContext } from '@/contexts/AuthContext';
import { logErrorToSentry } from '@/lib/sentry';
import { AuthState } from '@/types/auth/AuthState';
import UserProfile from '@/types/auth/UserProfile';

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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthData must be used within an AuthProvider');
  }
  const { state, setUser, dispatch } = context;

  // Use the separate SWR hook
  const {
    data: userData,
    isValidating: isUserDataLoading,
    error: userDataError,
    mutate: refreshUserData,
  } = useUserProfile();

  // Sync SWR data with auth context
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
      setUser(userData);
    } else if (!userData && !isUserDataLoading && !userDataError) {
      // Not logged in or no data - set to idle state
      // Only do this if we're not currently loading and there's no error
      dispatch({ type: 'SET_LOADING', payload: false });
      setUser(null);
    }
  }, [userData, isUserDataLoading, userDataError, setUser, dispatch]);

  return {
    ...state,
    userData,
    userDataError,
    refreshUserData,
  };
}

export default useAuthData;
