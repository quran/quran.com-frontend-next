import dynamic from 'next/dynamic';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import styles from './HomePageHero.module.scss';
import QuickLinks from './QuickLinks';

import SearchInput from '@/components/Search/SearchInput';

const PlayRadioButton = dynamic(() => import('./PlayRadioButton'));

const HomePageHero = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.outerContainer}>
      <Head>
        <link rel="preload" as="image" href="/images/background.jpg" />
      </Head>
      <div className={styles.backgroundImage} />
      <div>
        <PlayRadioButton />
        <div className={styles.innerContainer}>
          <SearchInput placeholder={t('command-bar.placeholder')} shouldExpandOnClick />
          <div className={styles.quickLinksContainer}>
            <QuickLinks />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePageHero;
