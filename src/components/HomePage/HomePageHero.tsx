import dynamic from 'next/dynamic';

import styles from './HomePageHero.module.scss';
import QuickLinks from './QuickLinks';

import CommandBarTrigger from '@/components/CommandBar/CommandBarTrigger';

const PlayRadioButton = dynamic(() => import('./PlayRadioButton'));

const HomePageHero = () => {
  return (
    <div className={styles.outerContainer}>
      <div data-theme="light">
        <PlayRadioButton />
        <div className={styles.innerContainer}>
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
