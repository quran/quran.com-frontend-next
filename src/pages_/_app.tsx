import React from 'react';
import { DefaultSeo } from 'next-seo';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { theme } from '../utils/styles';
import { createSEOConfig } from '../utils/seo';
import Footer from '../components/Footer';
import store, { persistor } from '../redux/store';

function MyApp({ Component, pageProps }): JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <DefaultSeo {...createSEOConfig({})} />
          <Component {...pageProps} />
          <Footer />
        </ThemeProvider>
      </PersistGate>
    </Provider>
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
