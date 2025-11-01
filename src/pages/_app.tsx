import { useEffect } from 'react';

import { DirectionProvider } from '@radix-ui/react-direction';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import useSWRImmutable from 'swr/immutable';

import AppContent from '@/components/AppContent/AppContent';
import FontPreLoader from '@/components/Fonts/FontPreLoader';
import { OnboardingProvider } from '@/components/Onboarding/OnboardingProvider';
import SessionIncrementor from '@/components/SessionIncrementor';
import ThirdPartyScripts from '@/components/ThirdPartyScripts/ThirdPartyScripts';
import { AuthProvider } from '@/contexts/AuthContext';
import ToastContainerProvider from '@/dls/Toast/ToastProvider';
import ReduxProvider from '@/redux/Provider';
import UserProfile from '@/types/auth/UserProfile';
import { API_HOST } from '@/utils/api';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { USER_ID_COOKIE_NAME } from '@/utils/auth/constants';
import { logAndRedirectUnsupportedLogicalCSS } from '@/utils/css';
import * as gtag from '@/utils/gtag';
import { getDir } from '@/utils/locale';
import { REDUX_STATE_PROP_NAME } from '@/utils/withSsrRedux';
import DataContext from 'src/contexts/DataContext';
import ThemeProvider from 'src/styles/ThemeProvider';
import { AudioPlayerMachineProvider } from 'src/xstate/AudioPlayerMachineContext';

import 'src/styles/reset.scss';
import 'src/styles/fonts.scss';
import 'src/styles/theme.scss';
import 'src/styles/global.scss';
import 'src/styles/variables.scss';

/**
 * Helper function to check if user is authenticated by looking for auth token in cookies.
 * Returns true only if the USER_ID_COOKIE_NAME cookie exists (indicates logged-in user).
 *
 * @returns {boolean} True if user has an authentication token, false otherwise
 */
const isUserAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    // On server-side, we cannot access cookies directly
    // The initial fetch will be skipped, and the client will handle it
    return false;
  }
  // Check if the user ID cookie exists (indicator of authentication)
  const cookies = document.cookie.split(';');
  return cookies.some((cookie) => cookie.trim().startsWith(USER_ID_COOKIE_NAME));
};

function MyApp({ Component, pageProps }): JSX.Element {
  const router = useRouter();
  const { locale } = router;
  const resolvedLocale = locale ?? 'en';
  const languageDirection = getDir(resolvedLocale);
  const buildInfo = {
    date: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
    hash: process.env.NEXT_PUBLIC_COMMIT_HASH || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '',
    env: process.env.NEXT_PUBLIC_APP_ENV,
  };

  // Only fetch user profile if user is authenticated (has auth token in cookies)
  // Pass null as key for guests to prevent any network request
  useSWRImmutable<UserProfile | null>(
    isUserAuthenticated() ? makeUserProfileUrl() : null,
    async () => {
      try {
        const profile = await getUserProfile();
        return profile;
      } catch (error) {
        // Handle authentication errors gracefully (e.g., 401 Unauthorized)
        // Return null instead of throwing to allow component to continue
        return null;
      }
    },
  );

  // listen to in-app changes of the locale and update the HTML dir accordingly.
  useEffect(() => {
    document.documentElement.dir = languageDirection;
    logAndRedirectUnsupportedLogicalCSS();
  }, [languageDirection]);

  useEffect(() => {
    const handleRouteChange = (url: string) => gtag.pageView(url);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <AuthProvider>
      <Head>
        <link rel="apple-touch-icon" sizes="192x192" href="/images/logo/Logo@192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href={API_HOST} />
      </Head>
      <Script id="build-info" strategy="beforeInteractive">
        {`window.__BUILD_INFO__ = ${JSON.stringify(buildInfo)};`}
      </Script>
      <FontPreLoader locale={resolvedLocale} />
      <DirectionProvider dir={languageDirection}>
        <TooltipProvider>
          <ToastContainerProvider>
            <DataContext.Provider value={pageProps.chaptersData}>
              <AudioPlayerMachineProvider>
                <ReduxProvider
                  locale={locale}
                  countryLanguagePreference={pageProps.countryLanguagePreference}
                  reduxState={pageProps[REDUX_STATE_PROP_NAME]}
                >
                  <ThemeProvider>
                    <OnboardingProvider>
                      <AppContent Component={Component} pageProps={pageProps} />
                    </OnboardingProvider>
                  </ThemeProvider>
                  <SessionIncrementor />
                </ReduxProvider>
              </AudioPlayerMachineProvider>
            </DataContext.Provider>
          </ToastContainerProvider>
        </TooltipProvider>
      </DirectionProvider>
      <ThirdPartyScripts />
    </AuthProvider>
  );
}

export default MyApp;
