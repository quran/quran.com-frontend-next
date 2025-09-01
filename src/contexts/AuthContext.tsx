import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

import { authReducer, initialState } from './authActions';

import { AuthState } from '@/types/auth/AuthState';
import UserProfile from '@/types/auth/UserProfile';

/**
 * Authentication Context Type
 * Defines the shape of the context value provided to consumers
 */
export interface AuthContextType {
  /** Current authentication state */
  state: AuthState;
  /** Dispatch function to update authentication state */
  dispatch: React.Dispatch<any>;
  /** Helper function to set authenticated user */
  login: (user: UserProfile) => void;
  /** Helper function to log out user */
  logout: () => void;
  /** Helper function to update user profile */
  updateProfile: (user: UserProfile) => void;
}

/**
 * Authentication Context
 * React context for sharing authentication state across the application
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for the AuthProvider component
 */
export interface AuthProviderProps {
  /** Child components that will have access to auth context */
  children: React.ReactNode;
}

/**
 * Custom hook to access authentication context
 * @returns {AuthContextType} Authentication context with state and helper functions
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

/**
 * Authentication Provider Component
 * Provides authentication context to the entire application
 * @param {AuthProviderProps} props - Props for the AuthProvider component
 * @returns {JSX.Element} AuthProvider component
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Helper function to set authenticated user
   */
  const login = useCallback(
    (user: UserProfile) => {
      dispatch({ type: 'SET_USER', payload: user });
    },
    [dispatch],
  );

  /**
   * Helper function to log out user
   */
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  /**
   * Helper function to update user profile
   */
  const updateProfile = useCallback(
    (user: UserProfile) => {
      dispatch({ type: 'SET_USER', payload: user });
    },
    [dispatch],
  );

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      login,
      logout,
      updateProfile,
    }),
    [state, dispatch, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
