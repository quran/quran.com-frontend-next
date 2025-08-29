import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';

import { useRouter } from 'next/router';

import UserProfile from '@/types/auth/UserProfile';
import { isCompleteProfile } from '@/utils/auth/complete-signup';
import { ROUTES } from '@/utils/navigation';
import { isAuthPage } from '@/utils/routes';

/**
 * Authentication State Interface
 * Defines the shape of the authentication state managed by the context
 */
export interface AuthState {
  /** Current user profile data */
  user: UserProfile | null;
  /** Loading state for authentication operations */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Error message if authentication fails */
  error: string | null;
  /** Whether the user's profile is complete */
  isProfileComplete: boolean;
}

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
 * Authentication Reducer
 * Pure function that handles state transitions based on dispatched actions
 * @param {AuthState} state - Current authentication state
 * @param {AuthAction} action - Action to process
 * @returns {AuthState} New authentication state
 */
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER': {
      const user = action.payload;
      return {
        ...state,
        user,
        isAuthenticated: !!user,
        isProfileComplete: user ? isCompleteProfile(user) : false,
        isLoading: false,
        error: null,
      };
    }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_PROFILE_COMPLETE':
      return { ...state, isProfileComplete: action.payload };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

/**
 * Authentication Context Type
 * Defines the shape of the context value provided to consumers
 */
interface AuthContextType {
  /** Current authentication state */
  state: AuthState;
  /** Dispatch function to update authentication state */
  dispatch: React.Dispatch<AuthAction>;
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
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for the AuthProvider component
 */
interface AuthProviderProps {
  /** Child components that will have access to auth context */
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Provides authentication context to the entire application.
 * Handles automatic redirects based on authentication state and profile completion.
 *
 * Features:
 * - Profile completion flow management for authenticated users
 * - Loading state management
 * - Error handling
 * - Unauthenticated users can use the app normally without restrictions
 *
 * @param {AuthProviderProps} props - Component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {JSX.Element} JSX element with auth context provider
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <MyApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  /**
   * Helper function to set authenticated user
   * Automatically updates authentication state and profile completion status
   */
  const login = useCallback((user: UserProfile) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  /**
   * Helper function to log out user
   * Clears authentication state and redirects to login page
   */
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    router.push('/login');
  }, [router]);

  /**
   * Helper function to update user profile
   * Useful for profile updates without full re-authentication
   */
  const updateProfile = useCallback((user: UserProfile) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  /**
   * Handles authentication redirects based on current state
   * Automatically redirects users to appropriate pages based on:
   * - Authentication status
   * - Profile completion status
   * - Current route type (auth vs non-auth)
   */
  const handleAuthRedirect = useCallback((authState: AuthState, routerInstance: any) => {
    const currentPath = routerInstance.pathname;
    const isAuthRoute = isAuthPage(routerInstance);

    // Only handle redirects for authenticated users
    if (!authState.isAuthenticated) {
      return; // Let unauthenticated users use the app normally
    }

    // Handle profile completion for authenticated users
    if (!authState.isProfileComplete && currentPath !== ROUTES.COMPLETE_SIGNUP) {
      if (!isAuthRoute || currentPath === ROUTES.COMPLETE_SIGNUP) return;
      routerInstance.push(ROUTES.COMPLETE_SIGNUP);
      return;
    }

    // Handle authenticated users with complete profiles
    if (authState.isProfileComplete) {
      if (isAuthRoute && currentPath !== ROUTES.COMPLETE_SIGNUP) {
        routerInstance.push(ROUTES.HOME);
      } else if (currentPath === ROUTES.COMPLETE_SIGNUP) {
        routerInstance.push(ROUTES.HOME);
      }
    }
  }, []);

  // Handle authentication redirects when state changes
  useEffect(() => {
    if (state.isLoading) return;
    handleAuthRedirect(state, router);
  }, [state, router, handleAuthRedirect]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(
    () => ({
      state,
      dispatch,
      login,
      logout,
      updateProfile,
    }),
    [state, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 *
 * @returns {AuthContextType} Authentication context with state and helper functions
 * @throws Error if used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, login, logout } = useAuth();
 *
 *   if (state.isLoading) return <div>Loading...</div>;
 *   if (!state.isAuthenticated) return <div>Please log in</div>;
 *
 *   return (
 *     <div>
 *       Welcome, {state.user?.firstName}!
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
