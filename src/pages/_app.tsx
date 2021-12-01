import React, { useEffect } from 'react';

import { IdProvider } from '@radix-ui/react-id';
import { DefaultSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { useRouter } from 'next/router';

import AudioPlayer from 'src/components/AudioPlayer/AudioPlayer';
import DeveloperUtility from 'src/components/DeveloperUtility/DeveloperUtility';
import FeedbackWidget from 'src/components/FeedbackWidget/FeedbackWidget';
import FontPreLoader from 'src/components/Fonts/FontPreLoader';
import GlobalListeners from 'src/components/GlobalListeners';
import Navbar from 'src/components/Navbar/Navbar';
import ThirdPartyScripts from 'src/components/ThirdPartyScripts/ThirdPartyScripts';
import ReduxProvider from 'src/redux/Provider';
import ThemeProvider from 'src/styles/ThemeProvider';
import { API_HOST } from 'src/utils/api';
import { getDir } from 'src/utils/locale';
import { createSEOConfig } from 'src/utils/seo';

import 'src/styles/reset.scss';
import 'src/styles/fonts.scss';
import 'src/styles/theme.scss';
import 'src/styles/global.scss';

function MyApp({ Component, pageProps }): JSX.Element {
  const { locale, asPath } = useRouter();
  const { t } = useTranslation('common');
  // listen to in-app changes of the locale and update the HTML dir accordingly.
  useEffect(() => {
    document.documentElement.dir = getDir(locale);
  }, [locale]);
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href={API_HOST} />
      </Head>
      <FontPreLoader locale={locale} />
      <ReduxProvider locale={locale}>
        <ThemeProvider>
          <IdProvider>
            <DefaultSeo
              {...createSEOConfig({ path: asPath, locale, description: t('default-description') })}
            />
            <GlobalListeners />
            <Navbar />
            <DeveloperUtility />
            <Component {...pageProps} />
            <FeedbackWidget />
            <AudioPlayer />
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
