import { AuthState } from '@/types/auth/AuthState';
import UserProfile from '@/types/auth/UserProfile';
import { isCompleteProfile } from '@/utils/auth/complete-signup';

/**
 * Authentication Actions
 * Defines all possible actions that can be dispatched to update auth state
 */
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE_COMPLETE'; payload: boolean }
  | { type: 'LOGOUT' };

/**
 * Initial authentication state
 * Used when the context is first created or after logout
 */
export const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  isProfileComplete: false,
};

/**
 * Handle SET_LOADING action
 * @param {AuthState} state - Current authentication state
 * @param {boolean} payload - Loading state payload
 * @returns {AuthState} Updated authentication state
 */
function handleSetLoading(state: AuthState, payload: boolean): AuthState {
  return {
    ...state,
    isLoading: payload,
  };
}

/**
 * Handle SET_USER action
 * @param {AuthState} state - Current authentication state
 * @param {UserProfile | null} user - User profile data
 * @returns {AuthState} Updated authentication state
 */
function handleSetUser(state: AuthState, user: UserProfile | null): AuthState {
  const isAuthenticated = !!user;
  const isProfileComplete = user ? isCompleteProfile(user) : false;

  return {
    ...state,
    user,
    isAuthenticated,
    isProfileComplete,
    isLoading: false,
    error: null,
  };
}

/**
 * Handle SET_ERROR action
 * @param {AuthState} state - Current authentication state
 * @param {string} error - Error message
 * @returns {AuthState} Updated authentication state
 */
function handleSetError(state: AuthState, error: string): AuthState {
  return {
    ...state,
    error,
    isLoading: false,
  };
}

/**
 * Handle SET_PROFILE_COMPLETE action
 * @param {AuthState} state - Current authentication state
 * @param {boolean} isComplete - Whether profile is complete
 * @returns {AuthState} Updated authentication state
 */
function handleSetProfileComplete(state: AuthState, isComplete: boolean): AuthState {
  return { ...state, isProfileComplete: isComplete };
}

/**
 * Handle LOGOUT action
 * @returns {AuthState} Initial authentication state
 */
function handleLogout(): AuthState {
  return {
    ...initialState,
    isLoading: false,
  };
}

/**
 * Authentication reducer function
 * @param {AuthState} state - Current authentication state
 * @param {AuthAction} action - Action to process
 * @returns {AuthState} Updated authentication state
 */
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return handleSetLoading(state, action.payload);
    case 'SET_USER':
      return handleSetUser(state, action.payload);
    case 'SET_ERROR':
      return handleSetError(state, action.payload);
    case 'SET_PROFILE_COMPLETE':
      return handleSetProfileComplete(state, action.payload);
    case 'LOGOUT':
      return handleLogout();
    default:
      return state;
  }
}
