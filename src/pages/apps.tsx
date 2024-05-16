/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import Image from 'next/image';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './apps.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Link from '@/dls/Link/Link';
import QuranAppLogo from '@/public/images/quran-app-logo.png';
import QuranAppImage from '@/public/images/quran-app.png';
import TarteelAppImage from '@/public/images/tarteel-app.png';
import { logTarteelLinkClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

type AppProps = {
  app: any;
  isFlipped?: boolean;
  isMain?: boolean;
};
const App = ({ app, isFlipped, isMain }: AppProps) => {
  const onTarteelAppClicked = (isIOS: boolean) => {
    // eslint-disable-next-line i18next/no-literal-string
    logTarteelLinkClick(`apps_page_${isIOS ? 'iOS' : 'android'}`);
  };

  return (
    <div
      className={classNames(styles.sideBySideLayout, isFlipped && styles.layoutFlipped)}
      key={app.title}
    >
      <div className={styles.texts}>
        <Image src={app.logo} height={60} width={60} alt={app.title} />
        {isMain ? (
          <h1 className={styles.heading}>{app.title}</h1>
        ) : (
          <p className={styles.heading}>{app.title}</p>
        )}
        <p>{app.description}</p>
        <div className={styles.downloadButtonsContainer}>
          <Link
            href={app.ios}
            isNewTab
            {...(app.isTarteel && {
              onClick: () => {
                onTarteelAppClicked(true);
              },
            })}
          >
            <Image src="/images/app-store.svg" width={135} height={40} alt="App Store" />
          </Link>
          <Link
            href={app.android}
            isNewTab
            {...(app.isTarteel && {
              onClick: () => {
                onTarteelAppClicked(false);
              },
            })}
          >
            <Image src="/images/play-store.svg" width={135} height={40} alt="Play Store" />
          </Link>
        </div>
      </div>
      <div>
        <Image
          className={styles.appImage}
          src={app.preview}
          height={1012}
          width={801}
          alt={app.title}
        />
      </div>
    </div>
  );
};

const path = '/apps';
const AppsPage = () => {
  const { t, lang } = useTranslation();

  const apps = {
    quran: {
      title: 'Quran.com',
      description: t('apps:quran-desc'),
      ios: 'https://itunes.apple.com/us/app/quran-by-quran.com-qran/id1118663303',
      android:
        'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&utm_source=quran-com&utm_campaign=download',
      preview: QuranAppImage,
      logo: QuranAppLogo,
    },
    tarteel: {
      title: 'Tarteel.ai',
      description: <Trans i18nKey="apps:tarteel-desc" components={[<br key="1" />]} />,
      ios: 'https://apps.apple.com/app/tarteel/id1391009396',
      android: 'https://play.google.com/store/apps/details?id=com.mmmoussa.iqra',
      preview: TarteelAppImage,
      logo: '/icons/tarteel-logo.svg',
      isTarteel: true,
    },
  };

  return (
    <>
      <NextSeoWrapper
        title={t('common:mobile-apps')}
        url={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <PageContainer>
        <App app={apps.quran} isMain />
        <App app={apps.tarteel} isFlipped />
      </PageContainer>
    </>
  );
};

export default AppsPage;
