import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import dynamic from 'next/dynamic';
import { DefaultSeo } from 'next-seo';
import { ThemeProvider } from 'styled-components';
import * as Sentry from '@sentry/node';
import { RewriteFrames, ExtraErrorData } from '@sentry/integrations';
import getConfig from 'next/config';
import { theme } from '../utils/styles';
import { createSEOConfig } from '../utils/seo';
import Footer from '../components/Footer';
import ReduxProvider from '../redux/Provider';
import { useApollo } from '../apolloClient';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const config = getConfig();
  const distDir = `${config.serverRuntimeConfig.rootDir}/.next`;

  Sentry.init({
    enabled: process.env.NODE_ENV === 'production',
    integrations: [
      new ExtraErrorData(),
      new RewriteFrames({
        iteratee: (frame) => {
          // eslint-disable-next-line no-param-reassign
          frame.filename = frame.filename.replace(distDir, 'app:///_next');
          return frame;
        },
      }),
    ],
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
}

const Toasts = dynamic(() => import('../components/dls/Toasts/Toasts'), { ssr: false });

function MyApp({ Component, pageProps }): JSX.Element {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <ReduxProvider>
      <ThemeProvider theme={theme}>
        <DefaultSeo {...createSEOConfig({})} />
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
        <Footer />
        <Toasts />
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default MyApp;
