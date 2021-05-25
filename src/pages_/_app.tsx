import React from 'react';
import Head from 'next/head';
import { DefaultSeo } from 'next-seo';
import { ThemeProvider } from 'styled-components';
import DeveloperUtility from 'src/components/DeveloperUtility/DeveloperUtility';
import Navbar from 'src/components/Navbar/Navbar';
import AudioPlayer from 'src/components/AudioPlayer/AudioPlayer';
import { theme } from '../styles/theme';
import { createSEOConfig } from '../utils/seo';
import ReduxProvider from '../redux/Provider';
import '../styles/reset.css';
import '../styles/fonts.css';
import '../styles/uthmani-fonts.scss';

function MyApp({ Component, pageProps }): JSX.Element {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>
      <ReduxProvider>
        <ThemeProvider theme={theme}>
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
