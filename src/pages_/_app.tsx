import React from 'react';
import { DefaultSeo } from 'next-seo';
import { ThemeProvider } from 'styled-components';
import { theme } from '../utils/styles';
import { createSEOConfig } from '../utils/seo';
import Footer from '../components/Footer/Footer';
import ReduxProvider from '../redux/Provider';

function MyApp({ Component, pageProps }): JSX.Element {
  return (
    <ReduxProvider>
      <ThemeProvider theme={theme}>
        <DefaultSeo {...createSEOConfig({})} />
        <Component {...pageProps} />
        <Footer />
      </ThemeProvider>
    </ReduxProvider>
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
