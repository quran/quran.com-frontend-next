import { useEffect } from 'react';

import { DirectionProvider } from '@radix-ui/react-direction';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { DefaultSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';

import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';
import UserAccountModal from '@/components/Auth/UserAccountModal';
import DeveloperUtility from '@/components/DeveloperUtility/DeveloperUtility';
import FontPreLoader from '@/components/Fonts/FontPreLoader';
import GlobalListeners from '@/components/GlobalListeners';
import Navbar from '@/components/Navbar/Navbar';
import { OnboardingProvider } from '@/components/Onboarding/OnboardingProvider';
import SessionIncrementor from '@/components/SessionIncrementor';
import ThirdPartyScripts from '@/components/ThirdPartyScripts/ThirdPartyScripts';
import { AuthProvider } from '@/contexts/AuthContext';
import Footer from '@/dls/Footer/Footer';
import ToastContainerProvider from '@/dls/Toast/ToastProvider';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import useAuthData from '@/hooks/auth/useAuthData';
import ReduxProvider from '@/redux/Provider';
import { API_HOST } from '@/utils/api';
import { logAndRedirectUnsupportedLogicalCSS } from '@/utils/css';
import * as gtag from '@/utils/gtag';
import { getDir } from '@/utils/locale';
import { isAuthPage } from '@/utils/routes';
import { createSEOConfig } from '@/utils/seo';
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
  const { t } = useTranslation('common');

  useEffect(() => {
    document.documentElement.dir = getDir(locale);
    logAndRedirectUnsupportedLogicalCSS();
  }, [locale]);

  useEffect(() => {
    const handleRouteChange = (url: string) => gtag.pageView(url);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  const isAuth = isAuthPage(router);

  // Component that uses auth data - must be inside AuthProvider
  // eslint-disable-next-line react/no-multi-comp
  function AppContent() {
    const { userData } = useAuthData();

    return (
      <>
        <UserAccountModal announcement={userData?.announcement} consents={userData?.consents} />
        <DefaultSeo {...createSEOConfig({ locale, description: t('default-description') })} />
        <GlobalListeners />
        {!isAuth && <Navbar />}
        <DeveloperUtility />
        <Component {...pageProps} />
        <AudioPlayer />
        {!isAuth && <Footer />}
      </>
    );
  }

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
      <FontPreLoader locale={locale} />
      <DirectionProvider dir={getDir(locale)}>
        <TooltipProvider>
          <ToastContainerProvider>
            <DataContext.Provider value={pageProps.chaptersData}>
              <AudioPlayerMachineProvider>
                <ReduxProvider locale={locale}>
                  <ThemeProvider>
                    <OnboardingProvider>
                      <AppContent />
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
