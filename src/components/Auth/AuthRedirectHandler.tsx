import { useEffect, useCallback } from 'react';

import { useRouter } from 'next/router';

import { useAuthData } from '@/hooks/auth/useAuthData';
import { logErrorToSentry } from '@/lib/sentry';
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
    // Prevent redirects during SSR or before Next router is ready
    if (typeof window === 'undefined' || !router.isReady) {
      return;
    }

    const authState: AuthState = { isAuthenticated, isProfileComplete, isLoading };
    const destination = getAuthRedirectDestination(authState, router.pathname, router);

    if (destination && destination !== router.asPath) {
      // Add error handling for router.push
      router.replace(destination).catch((err) => {
        // Silently handle redirect errors to prevent console spam
        logErrorToSentry(err, {
          transactionName: 'AuthRedirectHandler',
          metadata: { destination },
        });
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
