import { useEffect } from 'react';

import { DirectionProvider } from '@radix-ui/react-direction';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
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
import useProfileRedirect from '@/hooks/useProfileRedirect';
import ReduxProvider from '@/redux/Provider';
import { API_HOST } from '@/utils/api';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isCompleteProfile } from '@/utils/auth/complete-signup';
import { isLoggedIn } from '@/utils/auth/login';
import { logAndRedirectUnsupportedLogicalCSS } from '@/utils/css';
import * as gtag from '@/utils/gtag';
import { getDir } from '@/utils/locale';
import { ROUTES } from '@/utils/navigation';
import { isAuthPage } from '@/utils/routes';
import { createSEOConfig } from '@/utils/seo';
import DataContext from 'src/contexts/DataContext';
import ThemeProvider from 'src/styles/ThemeProvider';
import { AudioPlayerMachineProvider } from 'src/xstate/AudioPlayerMachineContext';

import 'src/styles/fonts.scss';
import 'src/styles/global.scss';
import 'src/styles/reset.scss';
import 'src/styles/theme.scss';
import 'src/styles/variables.scss';

function MyApp({ Component, pageProps }): JSX.Element {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation('common');

  const DEDUPING_INTERVAL_MS = 30000; // 30 seconds
  const SWR_CONFIG = {
    revalidateOnFocus: false, // Prevent focus-based revalidation that causes random redirects
    revalidateOnReconnect: false, // Prevent network reconnect revalidation
    dedupingInterval: DEDUPING_INTERVAL_MS, // Cache for 30 seconds to reduce API calls
  };

  const isLoggedInUser = isLoggedIn();
  const {
    data: userData,
    error: userError,
    isValidating,
  } = useSWRImmutable(isLoggedInUser ? makeUserProfileUrl() : null, getUserProfile, SWR_CONFIG);

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

  useProfileRedirect(router, isLoggedInUser, userData, userError, isValidating);

  // Redirect logged-in users away from auth routes:
  // - If profile is complete: send to HOME.
  // - If incomplete: let useProfileRedirect handle sending to COMPLETE_SIGNUP.
  useEffect(() => {
    const currentPath = router.pathname;
    const isAuthRoute = isAuthPage(currentPath);

    if (!isAuthRoute) return;
    if (currentPath === ROUTES.COMPLETE_SIGNUP) return; // handled by the effect above
    if (!isLoggedInUser) return;

    if (isValidating || userError || !userData) return; // wait for profile

    const profileComplete = isCompleteProfile(userData);
    if (profileComplete) {
      router.replace(ROUTES.HOME);
    }
  }, [isLoggedInUser, userData, userError, isValidating, router.pathname, router]);

  return (
    <>
      <Head>
        <link rel="apple-touch-icon" sizes="192x192" href="/images/logo/Logo@192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href={API_HOST} />
      </Head>
      <Script id="build-info" strategy="afterInteractive">
        {`window.__BUILD_INFO__ = ${JSON.stringify({
          date: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
          hash: process.env.NEXT_PUBLIC_COMMIT_HASH || 'development',
          version: process.env.NEXT_PUBLIC_APP_VERSION || '',
          env: process.env.NEXT_PUBLIC_APP_ENV,
        })}`}
      </Script>
      <FontPreLoader locale={locale} />
      <DirectionProvider dir={getDir(locale)}>
        <TooltipProvider>
          <ToastContainerProvider>
            <DataContext.Provider value={pageProps.chaptersData}>
              <AudioPlayerMachineProvider>
                <ReduxProvider locale={locale}>
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

                      {!isAuthPage(router.pathname) && <Navbar />}

                      <DeveloperUtility />
                      <Component {...pageProps} />
                      <AudioPlayer />
                      {!isAuthPage(router.pathname) && <Footer />}
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
