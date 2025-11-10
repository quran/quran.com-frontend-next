import { useEffect } from 'react';

import { DirectionProvider } from '@radix-ui/react-direction';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { DefaultSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';
import UserAccountModal from '@/components/Auth/UserAccountModal';
import DeveloperUtility from '@/components/DeveloperUtility/DeveloperUtility';
import FontPreLoader from '@/components/Fonts/FontPreLoader';
import GlobalListeners from '@/components/GlobalListeners';
import Navbar from '@/components/Navbar/Navbar';
import { OnboardingProvider } from '@/components/Onboarding/OnboardingProvider';
import SessionIncrementor from '@/components/SessionIncrementor';
import ThirdPartyScripts from '@/components/ThirdPartyScripts/ThirdPartyScripts';
import Footer from '@/dls/Footer/Footer';
import ToastContainerProvider from '@/dls/Toast/ToastProvider';
import ReduxProvider from '@/redux/Provider';
import UserProfile from '@/types/auth/UserProfile';
import { API_HOST } from '@/utils/api';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isCompleteProfile } from '@/utils/auth/complete-signup';
import { USER_ID_COOKIE_NAME } from '@/utils/auth/constants';
import { logAndRedirectUnsupportedLogicalCSS } from '@/utils/css';
import * as gtag from '@/utils/gtag';
import { getDir } from '@/utils/locale';
import { ROUTES } from '@/utils/navigation';
import { isAuthPage } from '@/utils/routes';
import { createSEOConfig } from '@/utils/seo';
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
  const { t } = useTranslation('common');

  // Only fetch user profile if user is authenticated (has auth token in cookies)
  // Pass null as key for guests to prevent any network request
  const { data: userData } = useSWRImmutable<UserProfile | null>(
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

  // Derive logged-in status only from non-null userData when key is non-null
  // If key is null (guest), userData will be null regardless
  const isLoggedInUser = Boolean(userData);

  // listen to in-app changes of the locale and update the HTML dir accordingly.
  useEffect(() => {
    document.documentElement.dir = getDir(locale);
    logAndRedirectUnsupportedLogicalCSS();
  }, [locale]);

  // Record page view to Google analytics when user navigate to a new page.
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageView(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Redirect logged-in users away from complete-signup route to the home page if profile is complete
  useEffect(() => {
    if (isLoggedInUser && userData) {
      const isProfileComplete = isCompleteProfile(userData);
      if (isProfileComplete && router.pathname === ROUTES.COMPLETE_SIGNUP) {
        router.push(ROUTES.HOME);
      } else if (!isProfileComplete && router.pathname !== ROUTES.COMPLETE_SIGNUP) {
        router.push(ROUTES.COMPLETE_SIGNUP);
      }
    }
  }, [isLoggedInUser, userData, router]);

  // Redirect logged-in users away from auth routes to the home page
  useEffect(() => {
    const isAuthRoute = isAuthPage(router);
    if (isLoggedInUser && isAuthRoute && router.pathname !== ROUTES.COMPLETE_SIGNUP) {
      router.push(ROUTES.HOME);
    }
  }, [isLoggedInUser, router]);

  return (
    <>
      <Head>
        <link rel="apple-touch-icon" sizes="192x192" href="/images/logo/Logo@192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href={API_HOST} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__BUILD_INFO__ = {
              date: "${process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString()}",
              hash: "${process.env.NEXT_PUBLIC_COMMIT_HASH || 'development'}",
              version: "${process.env.NEXT_PUBLIC_APP_VERSION || ''}",
              env: "${process.env.NEXT_PUBLIC_APP_ENV}"
            }`,
          }}
        />
      </Head>
      <FontPreLoader locale={locale} />
      <DirectionProvider dir={getDir(locale)}>
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
                      <UserAccountModal
                        announcement={userData?.announcement}
                        consents={userData?.consents}
                      />
                      <DefaultSeo
                        {...createSEOConfig({ locale, description: t('default-description') })}
                      />
                      <GlobalListeners />

                      {!isAuthPage(router) && <Navbar />}

                      <DeveloperUtility />
                      <Component {...pageProps} />
                      <AudioPlayer />
                      {!isAuthPage(router) && <Footer />}
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
    </>
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
