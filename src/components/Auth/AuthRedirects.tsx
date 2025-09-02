/* eslint-disable react-func/max-lines-per-function */
import { useEffect } from 'react';

import { useRouter } from 'next/router';

import useAuthData from '@/hooks/auth/useAuthData';
import { ROUTES, getLoginNavigationUrl } from '@/utils/navigation';
import { isAuthPage } from '@/utils/routes';

/**
 * Global auth-based redirect handler.
 * Implements flows:
 * - Unauthenticated visiting complete-signup -> redirect to login with redirectTo
 * - Authenticated with incomplete profile -> force /complete-signup (except on that page)
 * - Authenticated with complete profile visiting auth pages -> redirect to home
 *
 * Client-only; returns null and renders nothing.
 * @returns {null}
 */
const AuthRedirects = (): null => {
  const router = useRouter();
  const { isAuthenticated, isProfileComplete, isLoading } = useAuthData();

  useEffect(() => {
    if (!router.isReady) return;
    if (isLoading) return; // avoid redirects while determining auth state

    const { pathname: path, asPath } = router;
    const onAuthPage = isAuthPage(router);

    // 1) Unauthenticated user trying to access complete signup -> send to login with redirect
    if (!isAuthenticated) {
      if (path === ROUTES.COMPLETE_SIGNUP) {
        const loginUrl = getLoginNavigationUrl(asPath);
        if (asPath !== loginUrl) router.replace(loginUrl);
      }
      return; // unauthenticated can browse public pages freely
    }

    // 2) Authenticated with incomplete profile -> restrict to /complete-signup
    if (isAuthenticated && !isProfileComplete) {
      if (path !== ROUTES.COMPLETE_SIGNUP) {
        router.replace(ROUTES.COMPLETE_SIGNUP);
      }
      return;
    }

    // 3) Authenticated with complete profile -> keep away from auth pages
    if (isAuthenticated && isProfileComplete && onAuthPage) {
      if (path !== ROUTES.HOME) router.replace(ROUTES.HOME);
    }
  }, [
    router.isReady,
    router.pathname,
    router.asPath,
    isAuthenticated,
    isProfileComplete,
    isLoading,
    router,
  ]);

  return null;
};

export default AuthRedirects;
