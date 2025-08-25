import { useEffect, useRef, useCallback } from 'react';

import type { NextRouter } from 'next/router';

import { isCompleteProfile } from '@/utils/auth/complete-signup';
import { ROUTES } from '@/utils/navigation';

/**
 * Redirect based on profile completeness once profile fetch is resolved and valid.
 * Uses requestAnimationFrame for safer async operations instead of setTimeout.
 * @param {NextRouter} router - The Next.js router object.
 * @param {boolean} isLoggedInUser - Whether the user is logged in.
 * @param {any} userData - The user data.
 * @param {any} userError - The user error.
 * @param {boolean} isValidating - Whether the profile is validating.
 * @param {boolean} hasValidProfile - Whether the profile is valid.
 */
const useProfileRedirect = (
  router: NextRouter,
  isLoggedInUser: boolean,
  userData: any,
  userError: any,
  isValidating: boolean,
  hasValidProfile: boolean,
): void => {
  const redirectFrameRef = useRef<number>();
  const lastRedirectRef = useRef<string>('');

  const performRedirect = useCallback(
    (targetRoute: string) => {
      lastRedirectRef.current = targetRoute;
      router.replace(targetRoute);
    },
    [router],
  );

  useEffect(() => {
    // Clear any pending redirects
    if (redirectFrameRef.current) {
      cancelAnimationFrame(redirectFrameRef.current);
    }

    if (!isLoggedInUser) return;
    if (isValidating) return; // wait until SWR settles
    if (userError) return; // don't redirect on error; treat as unauthenticated elsewhere
    if (!userData || !hasValidProfile) return;

    const isProfileComplete = isCompleteProfile(userData);
    const currentPath = router.pathname;
    let targetRoute: string | null = null;

    if (isProfileComplete && currentPath === ROUTES.COMPLETE_SIGNUP) {
      targetRoute = ROUTES.HOME;
    } else if (!isProfileComplete && currentPath !== ROUTES.COMPLETE_SIGNUP) {
      targetRoute = ROUTES.COMPLETE_SIGNUP;
    }

    // Only redirect if we have a target and it's different from last redirect
    if (targetRoute && lastRedirectRef.current !== targetRoute) {
      // Use requestAnimationFrame instead of setTimeout for safer async operation
      redirectFrameRef.current = requestAnimationFrame(() => {
        performRedirect(targetRoute!);
      });
    }
  }, [
    isLoggedInUser,
    userData,
    userError,
    isValidating,
    hasValidProfile,
    performRedirect,
    router.pathname,
  ]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (redirectFrameRef.current) {
        cancelAnimationFrame(redirectFrameRef.current);
      }
    };
  }, []);
};

export default useProfileRedirect;
