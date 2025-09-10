import { AuthState } from '@/types/auth/AuthState';
import { AuthError } from '@/types/auth/errorTypes';
import UserProfile from '@/types/auth/UserProfile';
import { isCompleteProfile } from '@/utils/auth/complete-signup';

/**
 * Authentication Actions
 * Defines all possible actions that can be dispatched to update auth state
 */
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_DATA'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: AuthError | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
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
  // null => unknown; we haven't successfully derived completeness yet
  isProfileComplete: null,
  profileLoaded: false,
};

/**
 * Handle SET_LOADING action
 * @param {AuthState} state - Current authentication state
 * @param {boolean} payload - Loading state payload
 * @returns {AuthState} Updated authentication state
 */
const handleSetLoading = (state: AuthState, payload: boolean): AuthState => {
  return {
    ...state,
    isLoading: payload,
  };
};

/**
 * Handle SET_USER action
 * @param {AuthState} state - Current authentication state
 * @param {UserProfile | null} user - User profile data
 * @returns {AuthState} Updated authentication state
 */
const handleSetUser = (state: AuthState, user: UserProfile | null): AuthState => {
  const isAuthenticated = !!user;
  const isProfileComplete = user ? isCompleteProfile(user) : null; // only derive when we have user

  return {
    ...state,
    user,
    isAuthenticated,
    isProfileComplete,
    isLoading: false,
    error: null,
    profileLoaded: true,
  };
};

/**
 * Handle SET_ERROR action
 * @param {AuthState} state - Current authentication state
 * @param {AuthError | null} error - Error message
 * @returns {AuthState} Updated authentication state
 */
const handleSetError = (state: AuthState, error: AuthError | null): AuthState => {
  return {
    ...state,
    error,
    isLoading: false,
    // Do not force profileLoaded true if we never had a successful user fetch; keep prior value.
    // If we already loaded a profile earlier, preserve that; else remain false so logic can still await.
    profileLoaded: state.profileLoaded,
    // Preserve existing isProfileComplete (could be true/false from earlier) but never coerce to false.
  };
};

/**
 * Handle SET_AUTHENTICATED action
 * Allows toggling authentication independent of user profile availability
 * @param {AuthState} state - Current authentication state
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {AuthState} Updated authentication state
 */
const handleSetAuthenticated = (state: AuthState, isAuthenticated: boolean): AuthState => {
  return {
    ...state,
    isAuthenticated,
    isLoading: false,
    user: isAuthenticated ? state.user : null, // Clear user on logout
    isProfileComplete: isAuthenticated ? state.isProfileComplete : null, // Reset to unknown on logout
    error: isAuthenticated ? state.error : null, // Clear auth errors on logout
    profileLoaded: isAuthenticated ? state.profileLoaded : false,
  };
};

/**
 * Handle LOGOUT action
 * @returns {AuthState} Initial authentication state
 */
const handleLogout = (): AuthState => {
  return {
    ...initialState,
    isLoading: false,
    profileLoaded: false,
  };
};

const assertNever = (x: never): never => {
  // Ensures compile-time exhaustiveness
  throw new Error(`Unhandled action type: ${JSON.stringify(x)}`);
};

/**
 * Authentication reducer function
 * @param {AuthState} state - Current authentication state
 * @param {AuthAction} action - Action to process
 * @returns {AuthState} Updated authentication state
 */
export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return handleSetLoading(state, action.payload);
    case 'SET_USER_DATA':
      return handleSetUser(state, action.payload);
    case 'SET_ERROR':
      return handleSetError(state, action.payload);
    case 'SET_AUTHENTICATED':
      return handleSetAuthenticated(state, action.payload);
    case 'LOGOUT':
      return handleLogout();
    default:
      return assertNever(action as never);
  }
};
