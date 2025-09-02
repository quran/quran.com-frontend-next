import { NextRouter } from 'next/router';

import { ROUTES } from '@/utils/navigation';
import { isAuthPage } from '@/utils/routes';

export interface AuthState {
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isLoading: boolean;
}

/**
 * Determines the appropriate redirect destination based on authentication state
 * @param {AuthState} authState - Current authentication state
 * @param {string} currentPath - Current router pathname
 * @param {any} router - Next.js router instance
 * @returns {string | null} Redirect destination or null if no redirect needed
 */
export const getAuthRedirectDestination = (
  authState: AuthState,
  currentPath: string,
  router: NextRouter,
): string | null => {
  const { isAuthenticated, isProfileComplete, isLoading } = authState;

  // Safety checks
  if (!router || !currentPath) {
    return null;
  }

  // Don't redirect while loading
  if (isLoading) {
    return null;
  }

  // Prevent infinite redirects by checking if we're already on the target path
  const isCurrentPageAuth = isAuthPage(router);

  // Flow A: Unauthenticated User Journey
  // - No redirects for unauthenticated users
  // - They can browse the app normally
  if (!isAuthenticated) {
    return null;
  }

  // Flow B: Authenticated User with Complete Profile
  if (isAuthenticated && isProfileComplete) {
    // If on auth page, redirect to home
    if (isCurrentPageAuth && currentPath !== ROUTES.HOME) {
      return ROUTES.HOME;
    }
    // Otherwise, allow normal access
    return null;
  }

  // Flow C: Authenticated User with Incomplete Profile
  if (isAuthenticated && !isProfileComplete) {
    // If on auth page but not complete-signup, redirect to complete-signup
    if (isCurrentPageAuth && currentPath !== ROUTES.COMPLETE_SIGNUP) {
      return ROUTES.COMPLETE_SIGNUP;
    }
    // If not on auth page, redirect to complete-signup
    if (!isCurrentPageAuth && currentPath !== ROUTES.COMPLETE_SIGNUP) {
      return ROUTES.COMPLETE_SIGNUP;
    }
    // If on complete-signup page, allow access
    return null;
  }

  return null;
};
