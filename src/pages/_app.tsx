import React from 'react';
import { DefaultSeo } from 'next-seo';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { BaseCSS } from 'styled-bootstrap-grid';
import { theme } from '../../utils/styles';
import { createSEOConfig } from '../../utils/seo';
import './global.css';
import Footer from '../components/Footer';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Maison Neue';
    src: url('/static/fonts/MaisonNeue-Medium.otf');
    /* src: url('/static/fonts/MaisonNeue-Bold.eot'); */
    /* src: url('/static/fonts/MaisonNeue-Bold.ttf'); */
    /* src: url('/static/fonts/MaisonNeueWEB-Bold.woff'); */
    /* src: url('/static/fonts/MaisonNeueWEB-Bold.woff2'); */
  }

  @font-face {
    font-family: 'Schear Grotesk';
    /* src: url('/static/fonts/SchearGrotesk-Black.eot'); */
    /* src: url('/static/fonts/SchearGrotesk-Black.ttf'); */
    src: url('/static/fonts/SchearGrotesk-Black.otf');
    /* src: url('/static/fonts/SchearGrotesk-Black.woff'); */
    /* src: url('/static/fonts/SchearGrotesk-Black.woff2'); */
  }
`;

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <DefaultSeo {...createSEOConfig({})} />
      <GlobalStyle />
      <BaseCSS />
      <Component {...pageProps} />
      <Footer />
    </ThemeProvider>
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
