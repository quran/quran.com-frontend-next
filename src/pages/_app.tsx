import React, { useEffect } from 'react';

import { IdProvider } from '@radix-ui/react-id';
import { DefaultSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { useRouter } from 'next/router';

import AudioPlayer from 'src/components/AudioPlayer/AudioPlayer';
import DeveloperUtility from 'src/components/DeveloperUtility/DeveloperUtility';
import ToastContainerProvider from 'src/components/dls/Toast/ToastProvider';
import FontPreLoader from 'src/components/Fonts/FontPreLoader';
import GlobalListeners from 'src/components/GlobalListeners';
import Navbar from 'src/components/Navbar/Navbar';
import ThirdPartyScripts from 'src/components/ThirdPartyScripts/ThirdPartyScripts';
import ReduxProvider from 'src/redux/Provider';
import ThemeProvider from 'src/styles/ThemeProvider';
import { API_HOST } from 'src/utils/api';
import { logAndRedirectUnsupportedLogicalCSS } from 'src/utils/css';
import { getDir } from 'src/utils/locale';
import { createSEOConfig } from 'src/utils/seo';

import 'src/styles/reset.scss';
import 'src/styles/fonts.scss';
import 'src/styles/theme.scss';
import 'src/styles/global.scss';

function MyApp({ Component, pageProps }): JSX.Element {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation('common');
  // listen to in-app changes of the locale and update the HTML dir accordingly.
  useEffect(() => {
    document.documentElement.dir = getDir(locale);
    logAndRedirectUnsupportedLogicalCSS();
  }, [locale]);

  useEffect(() => {
    const handleRouteChange = (url) => {
      // @ts-ignore
      if (window.gtag) window.gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href={API_HOST} />
        <meta
          name="ahrefs-site-verification"
          content="d9e06610b3345cfc8c1e17a750df73c73ad1934603f0201751d6f88c1b96410c"
        />
      </Head>
      <FontPreLoader locale={locale} />
      <ReduxProvider locale={locale}>
        <ThemeProvider>
          <IdProvider>
            <ToastContainerProvider>
              <DefaultSeo {...createSEOConfig({ locale, description: t('default-description') })} />
              <GlobalListeners />
              <Navbar />
              <DeveloperUtility />
              <Component {...pageProps} />
              <AudioPlayer />
            </ToastContainerProvider>
          </IdProvider>
        </ThemeProvider>
      </ReduxProvider>

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
