/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';

import QuranAppPreviewImage from '../../public/images/quran-app-preview.png';

import styles from './apps.module.scss';

import NextSeoWrapper from 'src/components/NextSeoWrapper';

const apps = {
  quran: {
    title: 'Quran.com',
    description:
      'By the developers of the Quran.com application, comes the beautiful and ad-free mushaf iOS and Android apps. It’s now easier to read the Quran on the go, memorize it, and listen to your favorite reciters. Al-hamdu Lillah!',
    ios: 'https://itunes.apple.com/us/app/quran-by-quran.com-qran/id1118663303',
    android:
      'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&utm_source=quran-com&utm_campaign=download',
    preview: QuranAppPreviewImage,
  },
  tarteel: {
    title: 'Tarteel.ai',
    description:
      'By the developers of the Quran.com application, comes the beautiful and ad-free mushaf iOS and Android apps. It’s now easier to read the Quran on the go, memorize it, and listen to your favorite reciters. Al-hamdu Lillah!',
    ios: 'https://itunes.apple.com/us/app/quran-by-quran.com-qran/id1118663303',
    android:
      'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&utm_source=quran-com&utm_campaign=download',
    preview: QuranAppPreviewImage,
  },
};

type AppProps = {
  app: any;
  isFlipped?: boolean;
};
const App = ({ app, isFlipped }: AppProps) => {
  return (
    <div
      className={classNames(styles.sideBySideLayout, isFlipped && styles.layoutFlipped)}
      key={app.title}
    >
      <div className={styles.texts}>
        <h1 className={styles.heading}>{app.title}</h1>
        <p>{app.description}</p>
        <div className={styles.downloadButtonsContainer}>
          <a href={app.ios}>
            <Image src="/images/app-store.svg" width={135} height={40} />
          </a>
          <a href={apps.quran.android}>
            <Image src="/images/play-store.svg" width={135} height={40} />
          </a>
        </div>
      </div>
      <div>
        <Image className={styles.appImage} src={QuranAppPreviewImage} height={1396} width={1176} />
      </div>
    </div>
  );
};

const AppsPage = () => {
  const { t } = useTranslation('privacy');
  return (
    <>
      <NextSeoWrapper title={t('header')} />
      <div className={styles.container}>
        <App app={apps.quran} />
        <App app={apps.tarteel} isFlipped />
      </div>
    </>
  );
};

export default AppsPage;
