/* eslint-disable consistent-return */
/* eslint-disable react-func/max-lines-per-function, indent, max-lines */
import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

import useAuthData from '@/hooks/auth/useAuthData';
import { logMessageToSentry, addSentryBreadcrumb } from '@/lib/sentry';
import QueryParam from '@/types/QueryParam';
import { isCompleteProfile } from '@/utils/auth/complete-signup'; // NEW: to recompute completeness defensively
import { ROUTES, getLoginNavigationUrl } from '@/utils/navigation';
import { isAuthPage } from '@/utils/routes';

const AuthRedirects = (): null => {
  const router = useRouter();
  const {
    isAuthenticated,
    isProfileComplete,
    isLoading,
    userData,
    profileLoaded,
    hasValidatedProfileFromNetwork,
    isRefreshingToken,
  } = useAuthData();
  const TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_AUTH_PROFILE_TIMEOUT_MS) || 4000;
  const timeoutFiredRef = useRef(false);

  // Core redirect effect: decides if/where to redirect once we know enough about auth + profile state.
  // NOTE: We intentionally gate redirects that depend on profile completeness behind
  // `hasValidatedProfileFromNetwork` to avoid acting on stale SWR cache values that can appear
  // momentarily during a token refresh (root cause of prior double redirect issue: chapter -> complete-signup -> home).
  useEffect(() => {
    if (!router.isReady) return;
    if (isLoading) return;
    const { pathname: path, asPath } = router;
    const onAuthPage = isAuthPage(router);
    if (!isAuthenticated) {
      // Unauthenticated user: ensure we don't leave them on a post-signup completion route.
      if (path === ROUTES.COMPLETE_SIGNUP) {
        const loginUrl = getLoginNavigationUrl(asPath);
        if (asPath !== loginUrl) router.replace(loginUrl);
      }
      return;
    }
    if (isAuthenticated && isProfileComplete === null && !profileLoaded) {
      // Auth session confirmed but profile still loading: defer any redirect decisions.
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
    if (isAuthenticated && profileLoaded && userData && isProfileComplete === false) {
      // Recompute completeness defensively in case context flag is stale vs latest userData
      const recomputedComplete = isCompleteProfile(userData as any);
      if (recomputedComplete) {
        addSentryBreadcrumb('auth.redirect', 'skip redirect - recomputed profile complete', {
          path,
          asPath,
          storedIsProfileComplete: isProfileComplete,
          recomputedComplete: true,
          userId: userData?.id ?? null,
        });
        return;
      }

      // Require a stable id; without id treat as still loading / not actionable
      if (userData?.id == null) {
        addSentryBreadcrumb('auth.redirect', 'skip incomplete redirect - missing user id', {
          path,
          asPath,
          hasValidatedProfileFromNetwork,
        });
        return;
      }

      if (!hasValidatedProfileFromNetwork) {
        // We saw an incomplete profile but only from (potentially) stale cache; wait for network validation.
        addSentryBreadcrumb(
          'auth.redirect',
          'skip incomplete redirect - awaiting network validation',
          {
            path,
            asPath,
            isAuthenticated,
            profileLoaded,
            isProfileComplete,
            hasValidatedProfileFromNetwork,
            isRefreshingToken,
            userId: userData?.id || null,
          },
        );
        return;
      }
      if (path !== ROUTES.COMPLETE_SIGNUP) {
        // Only log when we're actually performing the redirect, not when just evaluating
        logMessageToSentry('AuthRedirects redirect -> complete-signup', {
          transactionName: 'AuthRedirects',
          metadata: { from: path, to: ROUTES.COMPLETE_SIGNUP, userId: userData?.id || null },
        });
        addSentryBreadcrumb('auth.redirect', 'to complete-signup', {
          from: path,
          userId: userData?.id || null,
        });
        router.replace(ROUTES.COMPLETE_SIGNUP);
      }
      return;
    }
    if (isAuthenticated && isProfileComplete === true && onAuthPage) {
      if (!hasValidatedProfileFromNetwork) {
        // Avoid prematurely pushing a user off an auth page (e.g., login) if completeness may still change once network fetch validates.
        addSentryBreadcrumb(
          'auth.redirect',
          'skip auth-page redirect - awaiting network validation',
          {
            path,
            asPath,
            isAuthenticated,
            profileLoaded,
            isProfileComplete,
            hasValidatedProfileFromNetwork,
            isRefreshingToken,
            userId: userData?.id || null,
          },
        );
        return;
      }

      // Check for redirectTo query parameter
      const redirectTo = router.query[QueryParam.REDIRECT_TO] as string | undefined;
      const destination = redirectTo ? decodeURIComponent(redirectTo) : ROUTES.HOME;

      if (path !== destination && asPath !== destination) {
        logMessageToSentry('AuthRedirects redirect from auth page', {
          transactionName: 'AuthRedirects',
          metadata: { from: path, to: destination, userId: userData?.id || null },
        });
        addSentryBreadcrumb('auth.redirect', 'from auth page', { from: path, to: destination });
        router.replace(destination);
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
    hasValidatedProfileFromNetwork,
    isRefreshingToken,
    router,
  ]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!isAuthenticated) return;
    if (profileLoaded) return;
    if (timeoutFiredRef.current) return;
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
    }, TIMEOUT_MS);
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
