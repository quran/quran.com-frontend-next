import classNames from 'classnames';
import { useRouter } from 'next/router';
import { DefaultSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './AppContent.module.scss';

import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';
import AuthRedirects from '@/components/Auth/AuthRedirects';
import UserAccountModal from '@/components/Auth/UserAccountModal';
import DeveloperUtility from '@/components/DeveloperUtility/DeveloperUtility';
import GlobalListeners from '@/components/GlobalListeners';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/dls/Footer/Footer';
import useAuthData from '@/hooks/auth/useAuthData';
import useShowNavbar from '@/hooks/useShowNavbar';
import { selectIsBannerVisible } from '@/redux/slices/banner';
import { selectIsNavigationDrawerOpen, selectIsSettingsDrawerOpen } from '@/redux/slices/navbar';
import { isAuthPage } from '@/utils/routes';
import { createSEOConfig } from '@/utils/seo';

interface AppContentProps {
  Component: any;
  pageProps: any;
}

function AppContent({ Component, pageProps }: AppContentProps) {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation('common');
  const { userData } = useAuthData();
  const isAuth = isAuthPage(router);
  const showNavbar = useShowNavbar();
  const isNavigationDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  const isBannerVisible = useSelector(selectIsBannerVisible);

  return (
    <div
      className={classNames({
        bannerActive: isBannerVisible,
        navbarVisible: showNavbar,
        navbarHidden: !showNavbar,
      })}
    >
      <AuthRedirects />
      <UserAccountModal announcement={userData?.announcement} consents={userData?.consents} />
      <DefaultSeo {...createSEOConfig({ locale, description: t('default-description') })} />
      <GlobalListeners />
      {!isAuth && <Navbar />}
      <DeveloperUtility />
      <div
        className={classNames(styles.contentContainer, {
          [styles.dimmed]: isNavigationDrawerOpen || isSettingsDrawerOpen,
        })}
        {...((isNavigationDrawerOpen || isSettingsDrawerOpen) && {
          inert: true,
          'aria-hidden': true, // eslint-disable-line @typescript-eslint/naming-convention
        })}
      >
        <Component {...pageProps} />
      </div>
      <AudioPlayer />
      {!isAuth && <Footer />}
    </div>
  );
}

export default AppContent;
