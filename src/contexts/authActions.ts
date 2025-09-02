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
 * Authentication reducer function
 * @param {AuthState} state - Current authentication state
 * @param {AuthAction} action - Action to process
 * @returns {AuthState} Updated authentication state
 */
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_USER': {
      const isAuthenticated = !!action.payload;
      const isProfileComplete = action.payload ? isCompleteProfile(action.payload) : false;
      return {
        ...state,
        user: action.payload,
        isAuthenticated,
        isProfileComplete,
        isLoading: false,
        error: null,
      };
    }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'LOGOUT':
      return { ...initialState, isLoading: false };

    default:
      return state;
  }
}
