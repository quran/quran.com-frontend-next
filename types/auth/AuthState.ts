import UserProfile from '@/types/auth/UserProfile';

/**
 * Authentication State Interface
 * Simplified state management for authentication
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
