import classNames from 'classnames';
import { useRouter } from 'next/router';
import { DefaultSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';
import AuthRedirects from '@/components/Auth/AuthRedirects';
import UserAccountModal from '@/components/Auth/UserAccountModal';
import DeveloperUtility from '@/components/DeveloperUtility/DeveloperUtility';
import GlobalListeners from '@/components/GlobalListeners';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/dls/Footer/Footer';
import useAuthData from '@/hooks/auth/useAuthData';
import { selectIsBannerVisible } from '@/redux/slices/banner';
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
  const isBannerVisible = useSelector(selectIsBannerVisible);

  return (
    <div className={classNames({ bannerActive: isBannerVisible })}>
      <AuthRedirects />
      <UserAccountModal announcement={userData?.announcement} consents={userData?.consents} />
      <DefaultSeo {...createSEOConfig({ locale, description: t('default-description') })} />
      <GlobalListeners />
      {!isAuth && <Navbar />}
      <DeveloperUtility />
      <Component {...pageProps} />
      <AudioPlayer />
      {!isAuth && <Footer />}
    </div>
  );
}

export default AppContent;
