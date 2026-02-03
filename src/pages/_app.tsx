import { useEffect } from 'react';

import { DirectionProvider } from '@radix-ui/react-direction';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import Head from 'next/head';
import { useRouter } from 'next/router';

import AppContent from '@/components/AppContent/AppContent';
import FontPreLoader from '@/components/Fonts/FontPreLoader';
import { OnboardingProvider } from '@/components/Onboarding/OnboardingProvider';
import SessionIncrementor from '@/components/SessionIncrementor';
import ThirdPartyScripts from '@/components/ThirdPartyScripts/ThirdPartyScripts';
import { AuthProvider } from '@/contexts/AuthContext';
import ToastContainerProvider from '@/dls/Toast/ToastProvider';
import ReduxProvider from '@/redux/Provider';
import { API_HOST } from '@/utils/api';
import { logAndRedirectUnsupportedLogicalCSS } from '@/utils/css';
import * as gtag from '@/utils/gtag';
import { getDir } from '@/utils/locale';
import { REDUX_STATE_PROP_NAME } from '@/utils/withSsrRedux';
import DataContext from 'src/contexts/DataContext';
import ThemeProvider from 'src/styles/ThemeProvider';
import { AudioPlayerMachineProvider } from 'src/xstate/AudioPlayerMachineContext';

import 'src/styles/reset.scss';
import 'src/styles/fonts.scss';
import 'src/styles/theme.scss';
import 'src/styles/global.scss';
import 'src/styles/variables.scss';

function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {
  const router = useRouter();
  const { locale } = router;
  const resolvedLocale = locale ?? 'en';
  const languageDirection = getDir(resolvedLocale);

  useEffect(() => {
    document.documentElement.dir = languageDirection;
    logAndRedirectUnsupportedLogicalCSS();
  }, [languageDirection]);

  useEffect(() => {
    const handleRouteChange = (url: string) => gtag.pageView(url);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <AuthProvider>
      <Head>
        <link rel="apple-touch-icon" sizes="192x192" href="/images/logo/Logo@192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href={API_HOST} />
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `window.__BUILD_INFO__ = {
              date: "${process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString()}",
              hash: "${process.env.NEXT_PUBLIC_COMMIT_HASH || 'development'}",
              version: "${process.env.NEXT_PUBLIC_APP_VERSION || ''}",
              env: "${process.env.NEXT_PUBLIC_APP_ENV}"
            }`,
          }}
        />
      </Head>
      <FontPreLoader locale={resolvedLocale} />
      <DirectionProvider dir={languageDirection}>
        <TooltipProvider>
          <ToastContainerProvider>
            <DataContext.Provider value={pageProps.chaptersData}>
              <AudioPlayerMachineProvider>
                <ReduxProvider
                  locale={resolvedLocale}
                  countryLanguagePreference={pageProps.countryLanguagePreference}
                  reduxState={pageProps[REDUX_STATE_PROP_NAME]}
                  ssrPreferencesApplied={pageProps.ssrPreferencesApplied}
                >
                  <ThemeProvider>
                    <OnboardingProvider>
                      <AppContent Component={Component} pageProps={pageProps} />
                    </OnboardingProvider>
                  </ThemeProvider>
                  <SessionIncrementor />
                </ReduxProvider>
              </AudioPlayerMachineProvider>
            </DataContext.Provider>
          </ToastContainerProvider>
        </TooltipProvider>
      </DirectionProvider>
      <ThirdPartyScripts />
    </AuthProvider>
  );
}

export default MyApp;
