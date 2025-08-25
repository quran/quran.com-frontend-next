import { useEffect, useRef, useCallback } from 'react';

import type { NextRouter } from 'next/router';

import type UserProfile from '@/types/auth/UserProfile';
import { isCompleteProfile } from '@/utils/auth/complete-signup';
import { ROUTES } from '@/utils/navigation';

/**
 * Redirect based on profile completeness once profile fetch is resolved and valid.
 * Uses requestAnimationFrame for safer async operations instead of setTimeout.
 * @param {NextRouter} router - The Next.js router object.
 * @param {boolean} isLoggedInUser - Whether the user is logged in.
 * @param {UserProfile | undefined} userData - The user profile data.
 * @param {unknown} userError - Any error from fetching user data.
 * @param {boolean} isValidating - Whether the profile is validating.
 */
const useProfileRedirect = (
  router: NextRouter,
  isLoggedInUser: boolean,
  userData: UserProfile | undefined,
  userError: unknown,
  isValidating: boolean,
): void => {
  const redirectFrameRef = useRef<number>();
  // Track the last "from -> to" to avoid re-issuing identical redirects while still
  // allowing the same target if the source path changes.
  const lastRedirectKeyRef = useRef<string>('');

  const performRedirect = useCallback(
    (fromPath: string, targetRoute: string) => {
      lastRedirectKeyRef.current = `${fromPath}->${targetRoute}`;
      router.replace(targetRoute);
    },
    [router],
  );

  // Reset redirect tracking when pathname changes (user navigation)
  useEffect(() => {
    lastRedirectKeyRef.current = '';
  }, [router.pathname]);

  useEffect(() => {
    // Clear any pending redirects
    if (redirectFrameRef.current) {
      cancelAnimationFrame(redirectFrameRef.current);
    }

    if (!isLoggedInUser) return;
    if (isValidating) return; // wait until SWR settles
    if (userError) return; // don't redirect on error; treat as unauthenticated elsewhere
    // Wait until we have a profile object, but don't gate on "hasValidProfile":
    // we still need to redirect incomplete profiles to COMPLETE_SIGNUP.
    if (!userData) return;

    // Type guard: ensure userData is a valid UserProfile object
    if (!('id' in userData) || typeof userData.id !== 'string') return;

    const isProfileComplete = isCompleteProfile(userData);
    const currentPath = router.pathname;
    let targetRoute: string | null = null;

    if (isProfileComplete && currentPath === ROUTES.COMPLETE_SIGNUP) {
      targetRoute = ROUTES.HOME;
    } else if (!isProfileComplete && currentPath !== ROUTES.COMPLETE_SIGNUP) {
      targetRoute = ROUTES.COMPLETE_SIGNUP;
    }

    // Only redirect if we have a target and it's different from the last "from->to" pair
    const redirectKey = targetRoute ? `${currentPath}->${targetRoute}` : '';
    if (targetRoute && lastRedirectKeyRef.current !== redirectKey) {
      // Use requestAnimationFrame instead of setTimeout for safer async operation
      redirectFrameRef.current = requestAnimationFrame(() => {
        performRedirect(currentPath, targetRoute!);
      });
    }
  }, [isLoggedInUser, userData, userError, isValidating, performRedirect, router.pathname]);

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
