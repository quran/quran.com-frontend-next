/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';

import QuranAppPreviewImage from '../../public/images/quran-app-preview.png';

import styles from './apps.module.scss';

import NextSeoWrapper from 'src/components/NextSeoWrapper';
import { getCanonicalUrl } from 'src/utils/navigation';

type AppProps = {
  app: any;
  isFlipped?: boolean;
  isMain?: boolean;
};
const App = ({ app, isFlipped, isMain }: AppProps) => {
  return (
    <div
      className={classNames(styles.sideBySideLayout, isFlipped && styles.layoutFlipped)}
      key={app.title}
    >
      <div className={styles.texts}>
        {isMain ? (
          <h1 className={styles.heading}>{app.title}</h1>
        ) : (
          <p className={styles.heading}>{app.title}</p>
        )}
        <p>{app.description}</p>
        <div className={styles.downloadButtonsContainer}>
          <a href={app.ios}>
            <Image src="/images/app-store.svg" width={135} height={40} alt="App Store" />
          </a>
          <a href={app.android}>
            <Image src="/images/play-store.svg" width={135} height={40} alt="Play Store" />
          </a>
        </div>
      </div>
      <div>
        <Image
          className={styles.appImage}
          src={QuranAppPreviewImage}
          height={1396}
          width={1176}
          alt={app.title}
        />
      </div>
    </div>
  );
};

const AppsPage = () => {
  const { t, lang } = useTranslation();

  const apps = {
    quran: {
      title: 'Quran.com',
      description: t('apps:quran-desc'),
      ios: 'https://itunes.apple.com/us/app/quran-by-quran.com-qran/id1118663303',
      android:
        'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&utm_source=quran-com&utm_campaign=download',
      preview: QuranAppPreviewImage,
    },
    tarteel: {
      title: 'Tarteel.ai',
      description: t('apps:quran-desc'),
      ios: 'https://apps.apple.com/app/tarteel/id1391009396',
      android: 'https://play.google.com/store/apps/details?id=com.mmmoussa.iqra',
      preview: QuranAppPreviewImage,
    },
  };

  return (
    <>
      <NextSeoWrapper title={t('common:mobile-apps')} url={getCanonicalUrl(lang, '/apps')} />
      <div className={styles.container}>
        <App app={apps.quran} isMain />
        <App app={apps.tarteel} isFlipped />
      </div>
    </>
  );
};

export default AppsPage;
