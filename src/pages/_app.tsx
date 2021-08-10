import React from 'react';
import Head from 'next/head';
import { DefaultSeo } from 'next-seo';
import DeveloperUtility from 'src/components/DeveloperUtility/DeveloperUtility';
import Navbar from 'src/components/Navbar/Navbar';
import AudioPlayer from 'src/components/AudioPlayer/AudioPlayer';
import { createSEOConfig } from '../utils/seo';
import ReduxProvider from '../redux/Provider';
import ThemeProvider from '../styles/ThemeProvider';
import '../styles/reset.scss';
import '../styles/fonts.scss';
import '../styles/theme.scss';

function MyApp({ Component, pageProps }): JSX.Element {
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <ReduxProvider>
        <ThemeProvider>
          <DefaultSeo {...createSEOConfig({})} />
          <Navbar />
          <DeveloperUtility />
          <Component {...pageProps} />
          <AudioPlayer />
        </ThemeProvider>
      </ReduxProvider>
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
