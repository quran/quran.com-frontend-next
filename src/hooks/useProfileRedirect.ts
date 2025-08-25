import { useEffect } from 'react';

import type { NextRouter } from 'next/router';

import { isCompleteProfile } from '@/utils/auth/complete-signup';
import { ROUTES } from '@/utils/navigation';

/**
 * Redirect based on profile completeness once profile fetch is resolved and valid.
 * @param {NextRouter} router - The Next.js router object.
 * @param {boolean} isLoggedInUser - Whether the user is logged in.
 * @param {any} userData - The user data.
 * @param {any} userError - The user error.
 * @param {boolean} isValidating - Whether the profile is validating.
 * @param {boolean} hasValidProfile - Whether the profile is valid.
 * @returns {void}
 */
const useProfileRedirect = (
  router: NextRouter,
  isLoggedInUser: boolean,
  userData: any,
  userError: any,
  isValidating: boolean,
  hasValidProfile: boolean,
): void => {
  useEffect(() => {
    if (!isLoggedInUser) return;
    if (isValidating) return; // wait until SWR settles
    if (userError) return; // don't redirect on error; treat as unauthenticated elsewhere
    if (!userData || !hasValidProfile) return;

    const isProfileComplete = isCompleteProfile(userData);
    if (isProfileComplete && router.pathname === ROUTES.COMPLETE_SIGNUP) {
      router.replace(ROUTES.HOME);
    } else if (!isProfileComplete && router.pathname !== ROUTES.COMPLETE_SIGNUP) {
      router.replace(ROUTES.COMPLETE_SIGNUP);
    }
  }, [isLoggedInUser, userData, userError, isValidating, hasValidProfile, router]);
};

export default useProfileRedirect;
