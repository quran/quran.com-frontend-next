import useTranslation from 'next-translate/useTranslation';

import NavigationButton from './HeroButtons/NavigationButton';
import PopularButton from './HeroButtons/PopularButton';
import styles from './HomePageHero.module.scss';

import SearchInput from '@/components/Search/SearchInput';
import Logo from '@/icons/logo_main.svg';

const HomePageHero = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.outerContainer}>
      <div className={styles.backgroundImage} />
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
