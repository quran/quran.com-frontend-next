import Image from 'next/image';

import AlQuranulKarimSVG from '../../../public/images/alquranul-karim.svg';
import BackgroundImage from '../../../public/images/background.jpg';

import styles from './HomePageHero.module.scss';
import PrayerTimes from './PrayerTimes/PrayerTimes';
import QuickLinks from './QuickLinks';

import CommandBarTrigger from 'src/components/CommandBar/CommandBarTrigger';

const HomePageHero = () => {
  return (
    <div className={styles.outerContainer}>
      <div className={styles.backgroundImage}>
        <Image
          src={BackgroundImage}
          objectFit="cover"
          placeholder="empty"
          layout="fill"
          priority
          quality={100}
          objectPosition="left bottom"
        />
      </div>
      <div data-theme="light">
        <PrayerTimes />
        <div className={styles.innerContainer}>
          <div className={styles.imageContainer}>
            <AlQuranulKarimSVG />
          </div>
          <CommandBarTrigger />
          <div className={styles.quickLinksContainer}>
            <QuickLinks />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePageHero;
