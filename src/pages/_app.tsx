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

import 'src/styles/reset.scss';
import 'src/styles/fonts.scss';
import 'src/styles/theme.scss';
import 'src/styles/global.scss';
import 'src/styles/variables.scss';

function MyApp({ Component, pageProps }): JSX.Element {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation('common');

  const isLoggedInUser = isLoggedIn();
  const { data: userData } = useSWRImmutable(
    isLoggedInUser ? makeUserProfileUrl() : null,
    getUserProfile,
  );

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
