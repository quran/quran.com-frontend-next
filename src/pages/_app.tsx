import React from 'react';

import { IdProvider } from '@radix-ui/react-id';
import { DefaultSeo } from 'next-seo';
import Head from 'next/head';

import AudioPlayer from 'src/components/AudioPlayer/AudioPlayer';
import DeveloperUtility from 'src/components/DeveloperUtility/DeveloperUtility';
import FeedbackWidget from 'src/components/FeedbackWidget/FeedbackWidget';
import GlobalListeners from 'src/components/GlobalListeners';
import Navbar from 'src/components/Navbar/Navbar';
import ThirdPartyScripts from 'src/components/ThirdPartyScripts/ThirdPartyScripts';
import ReduxProvider from 'src/redux/Provider';
import ThemeProvider from 'src/styles/ThemeProvider';
import { API_HOST } from 'src/utils/api';
import { createSEOConfig } from 'src/utils/seo';

import 'src/styles/reset.scss';
import 'src/styles/fonts.scss';
import 'src/styles/theme.scss';
import 'src/styles/global.scss';

function MyApp({ Component, pageProps }): JSX.Element {
  return (
    <>
      <Head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/ProximaVara/proxima_vara_regular.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/ProximaVara/proxima_vara_semibold.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/ProximaVara/proxima_vara_bold.woff2"
          crossOrigin="anonymous"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href={API_HOST} />
      </Head>
      <ReduxProvider>
        <ThemeProvider>
          <IdProvider>
            <DefaultSeo {...createSEOConfig({})} />
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
