import Image from 'next/image';

import quranKarimLogo from '../../../public/images/quran-karim-logo.png';

import styles from './HomePageHero.module.scss';
import PrayerTimes from './PrayerTimes/PrayerTimes';
import QuickLinks from './QuickLinks';

import CommandBarTrigger from 'src/components/CommandBar/CommandBarTrigger';

const HomePageHero = () => {
  return (
    <div className={styles.outerContainer}>
      <PrayerTimes />
      <div className={styles.innerContainer}>
        <div className={styles.imageContainer}>
          <Image className={styles.homepageImage} src={quranKarimLogo} priority />
        </div>

        <CommandBarTrigger />
        <div className={styles.quickLinksContainer}>
          <QuickLinks />
        </div>
      </div>
    </div>
  );
};
export default HomePageHero;
