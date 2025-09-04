import type { AuthError } from '@/types/auth/errorTypes';
import type UserProfile from '@/types/auth/UserProfile';
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
  error: AuthError | null;
  /**
   * Whether the user's profile is complete.
   * null => unknown/not yet determined (e.g. profile fetch pending or failed transiently)
   * false => known incomplete (we have a user object but it's missing required fields)
   * true => known complete
   */
  isProfileComplete: boolean | null;
  /** Whether the profile (user object) has been loaded (success or error) */
  profileLoaded?: boolean;
}
