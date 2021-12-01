import AlQuranulKarimSVG from '../../../public/images/alquranul-karim.svg';

import styles from './HomePageHero.module.scss';
import PrayerTimes from './PrayerTimes/PrayerTimes';
import QuickLinks from './QuickLinks';

import CommandBarTrigger from 'src/components/CommandBar/CommandBarTrigger';

const HomePageHero = () => {
  return (
    <div className={styles.outerContainer}>
      <div className={styles.backgroundImage} />
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
