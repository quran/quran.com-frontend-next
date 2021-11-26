import Image from 'next/image';

import quranKarimLogo from '../../../public/images/quran-karim-logo.png';

import styles from './HomePageImage.module.scss';
import PrayerTimes from './PrayerTimes/PrayerTimes';

import CommandBarTrigger from 'src/components/CommandBar/CommandBarTrigger';

const HomepageHero = () => {
  return (
    <div className={styles.outerContainer}>
      <PrayerTimes />
      <div className={styles.innerContainer}>
        <div className={styles.imageContainer}>
          <Image className={styles.homepageImage} src={quranKarimLogo} objectFit="cover" priority />
        </div>

        <CommandBarTrigger />
      </div>
    </div>
  );
};
export default HomepageHero;
