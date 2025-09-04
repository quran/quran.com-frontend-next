/* eslint-disable react-func/max-lines-per-function, indent */
import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

import useAuthData from '@/hooks/auth/useAuthData';
import { logMessageToSentry, addSentryBreadcrumb } from '@/lib/sentry';
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
  const { isAuthenticated, isProfileComplete, isLoading, userData, profileLoaded } = useAuthData();

  // Timeout to avoid indefinite waiting for profileLoaded (e.g., network hang).
  const TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_AUTH_PROFILE_TIMEOUT_MS) || 4000;
  const timeoutFiredRef = useRef(false);
  // Removed snapshotDebounceRef

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
    // Guard: Authenticated but user profile not yet loaded (flicker prevention)
    // Without this, we might think profile is incomplete (default false) and redirect prematurely.
    if (isAuthenticated && isProfileComplete === null && !profileLoaded) {
      logMessageToSentry('AuthRedirects defer redirect until profile loads', {
        transactionName: 'AuthRedirects',
        metadata: { reason: 'awaiting-user-data', path, asPath },
      });
      addSentryBreadcrumb('auth.redirect', 'defer redirect until profile loads', {
        path,
        asPath,
        isAuthenticated,
        isProfileComplete,
        profileLoaded,
        userId: userData?.id || null,
      });
      return;
    }
    // 2) Authenticated with CONFIRMED incomplete profile -> restrict to /complete-signup
    //    We now require profileLoaded === true to avoid redirecting when the profile fetch
    //    failed or is still pending (previous behavior incorrectly redirected on timeout).
    if (isAuthenticated && profileLoaded && userData && isProfileComplete === false) {
      if (path !== ROUTES.COMPLETE_SIGNUP) {
        logMessageToSentry('AuthRedirects redirect -> complete-signup', {
          transactionName: 'AuthRedirects',
          metadata: { from: path, to: ROUTES.COMPLETE_SIGNUP, userId: userData?.id || null },
        });
        addSentryBreadcrumb('auth.redirect', 'to complete-signup', { from: path });
        router.replace(ROUTES.COMPLETE_SIGNUP);
      }
      return;
    }
    // 3) Authenticated with complete profile -> keep away from auth pages
    if (isAuthenticated && isProfileComplete === true && onAuthPage) {
      if (path !== ROUTES.HOME) {
        logMessageToSentry('AuthRedirects redirect -> home (auth page)', {
          transactionName: 'AuthRedirects',
          metadata: { from: path, to: ROUTES.HOME, userId: userData?.id || null },
        });
        addSentryBreadcrumb('auth.redirect', 'to home from auth page', { from: path });
        router.replace(ROUTES.HOME);
      }
    }
  }, [
    router.isReady,
    router.pathname,
    router.asPath,
    isAuthenticated,
    isProfileComplete,
    isLoading,
    userData,
    profileLoaded,
    router,
  ]);

  // Separate effect to handle timeout fallback when profileLoaded never resolves
  useEffect(() => {
    if (!router.isReady) return;
    if (!isAuthenticated) return; // Only relevant when logged in
    if (profileLoaded) return; // Already resolved
    if (timeoutFiredRef.current) return; // Already fired

    const id = setTimeout(() => {
      if (profileLoaded || timeoutFiredRef.current) return;
      timeoutFiredRef.current = true;
      const { pathname: path, asPath } = router;
      logMessageToSentry('AuthRedirects profile load timeout', {
        transactionName: 'AuthRedirects',
        metadata: {
          path,
          asPath,
          isAuthenticated,
          isProfileComplete,
          isLoading,
          profileLoaded,
          userId: userData?.id || null,
          timeoutMs: TIMEOUT_MS,
        },
      });
      addSentryBreadcrumb('auth.redirect', 'profile load timeout', {
        path,
        asPath,
        isAuthenticated,
        isProfileComplete,
        profileLoaded,
        userId: userData?.id || null,
        timeoutMs: TIMEOUT_MS,
      });
      // IMPORTANT: We no longer redirect on timeout because we cannot be certain the
      // profile is incomplete; doing so caused false positives when the profile API
      // was slow or failed. Only the main effect (which now requires profileLoaded)
      // will perform the redirect once we have definitive data.
    }, TIMEOUT_MS);

    // eslint-disable-next-line consistent-return
    return () => {
      clearTimeout(id);
    };
  }, [
    router.isReady,
    isAuthenticated,
    profileLoaded,
    isProfileComplete,
    isLoading,
    userData,
    router,
    TIMEOUT_MS,
  ]);

  return null;
};

export default AuthRedirects;
