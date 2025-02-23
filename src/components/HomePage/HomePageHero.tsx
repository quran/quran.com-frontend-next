import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import NavigationButton from './HeroButtons/NavigationButton';
import PopularButton from './HeroButtons/PopularButton';
import styles from './HomePageHero.module.scss';

import SearchInput from '@/components/Search/SearchInput';
import Background from '@/icons/background.svg';
import Logo from '@/icons/logo_main.svg';

const HomePageHero = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.outerContainer}>
      <Head>
        <link rel="preload" as="image" href="/images/background.png" />
      </Head>
      <div className={styles.backgroundImage}>
        <Background />
      </div>
      <div>
        <div className={styles.innerContainer}>
          <div className={styles.logoContainer}>
            <Logo />
          </div>
          <SearchInput
            placeholder={t('command-bar.placeholder')}
            shouldExpandOnClick
            shouldOpenDrawerOnMobile
          />
          <div className={styles.buttonsContainer}>
            <NavigationButton />
            <PopularButton />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePageHero;
