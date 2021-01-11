import React from 'react';
import Head from 'next/head';
import { DefaultSeo } from 'next-seo';
import { ThemeProvider } from 'styled-components';
import DeveloperUtility from 'src/components/developerUtility';
import { theme } from '../utils/styles';
import { createSEOConfig } from '../utils/seo';
import Footer from '../components/Footer';
import ReduxProvider from '../redux/Provider';

function MyApp({ Component, pageProps }): JSX.Element {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>
      <ReduxProvider>
        <ThemeProvider theme={theme}>
          <DefaultSeo {...createSEOConfig({})} />
          <DeveloperUtility />
          <Component {...pageProps} />
          <Footer />
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
