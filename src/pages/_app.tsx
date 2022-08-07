import React, { useEffect } from 'react';

import { IdProvider } from '@radix-ui/react-id';
import { useInterpret } from '@xstate/react';
import { DefaultSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

import AudioPlayer from 'src/components/AudioPlayer/AudioPlayer';
import DeveloperUtility from 'src/components/DeveloperUtility/DeveloperUtility';
import Footer from 'src/components/dls/Footer/Footer';
import ToastContainerProvider from 'src/components/dls/Toast/ToastProvider';
import DonatePopup from 'src/components/DonatePopup/DonatePopup';
import FontPreLoader from 'src/components/Fonts/FontPreLoader';
import GlobalListeners from 'src/components/GlobalListeners';
import UserAccountModal from 'src/components/Login/UserAccountModal';
import Navbar from 'src/components/Navbar/Navbar';
import SessionIncrementor from 'src/components/SessionIncrementor';
import ThirdPartyScripts from 'src/components/ThirdPartyScripts/ThirdPartyScripts';
import ReduxProvider from 'src/redux/Provider';
import ThemeProvider from 'src/styles/ThemeProvider';
import { API_HOST } from 'src/utils/api';
import { getUserProfile } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import { isLoggedIn } from 'src/utils/auth/login';
import { logAndRedirectUnsupportedLogicalCSS } from 'src/utils/css';
import * as gtag from 'src/utils/gtag';
import { getDir } from 'src/utils/locale';
import { createSEOConfig } from 'src/utils/seo';
import { audioPlayerMachine } from 'src/xstate/actors/audioPlayer/audioPlayerMachine';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

import 'src/styles/reset.scss';
import 'src/styles/fonts.scss';
import 'src/styles/theme.scss';
import 'src/styles/global.scss';
import 'src/styles/variables.scss';

function MyApp({ Component, pageProps }): JSX.Element {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation('common');
  const audioPlayerService = useInterpret(audioPlayerMachine);
  const { data: userData } = useSWRImmutable(
    isLoggedIn() ? makeUserProfileUrl() : null,
    async () => {
      const response = await getUserProfile();
      return response;
    },
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

  return (
    <>
      <Head>
        <link rel="apple-touch-icon" sizes="192x192" href="/images/logo/Logo@192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href={API_HOST} />
      </Head>
      <FontPreLoader locale={locale} />
      <AudioPlayerMachineContext.Provider value={audioPlayerService}>
        <ReduxProvider locale={locale}>
          <ThemeProvider>
            <IdProvider>
              <ToastContainerProvider>
                <UserAccountModal
                  requiredFields={userData?.requiredFields}
                  announcement={userData?.announcement}
                />
                <DefaultSeo
                  {...createSEOConfig({ locale, description: t('default-description') })}
                />
                <GlobalListeners />
                <Navbar />
                <DeveloperUtility />
                <Component {...pageProps} />
                <AudioPlayer />
                <Footer />
                <DonatePopup />
              </ToastContainerProvider>
            </IdProvider>
          </ThemeProvider>
          <SessionIncrementor />
        </ReduxProvider>
      </AudioPlayerMachineContext.Provider>

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
