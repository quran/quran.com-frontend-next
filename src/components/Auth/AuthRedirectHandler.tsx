import { useEffect, useCallback } from 'react';

import { useRouter } from 'next/router';

import { useAuthData } from '@/hooks/auth/useAuthData';
import { getAuthRedirectDestination, AuthState } from '@/utils/auth/redirects';

/**
 * AuthRedirectHandler Component
 * Handles automatic redirects based on authentication and profile completion status
 * Implements all authentication flows described in docs/authentication-system.md
 * @returns {null} This component doesn't render anything
 */
const AuthRedirectHandler = (): null => {
  const router = useRouter();
  const { isAuthenticated, isProfileComplete, isLoading } = useAuthData();

  const handleRedirect = useCallback(() => {
    // Prevent redirects during server-side rendering or if router is not ready
    if (typeof window === 'undefined' || !router.pathname) {
      return;
    }

    const authState: AuthState = { isAuthenticated, isProfileComplete, isLoading };
    const destination = getAuthRedirectDestination(authState, router.pathname, router);

    if (destination && destination !== router.pathname) {
      // Add error handling for router.push
      router.push(destination).catch(() => {
        // Silently handle redirect errors to prevent console spam
      });
    }
  }, [isAuthenticated, isProfileComplete, isLoading, router]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  // This component doesn't render anything
  return null;
};

export default AuthRedirectHandler;
