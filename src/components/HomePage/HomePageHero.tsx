import dynamic from 'next/dynamic';
import Head from 'next/head';

import AlQuranulKarimSVG from '../../../public/images/alquranul-karim.svg';

import styles from './HomePageHero.module.scss';
import QuickLinks from './QuickLinks';

import CommandBarTrigger from 'src/components/CommandBar/CommandBarTrigger';

const PlayRadioButton = dynamic(() => import('./PlayRadioButton'));

const HomePageHero = () => {
  return (
    <div className={styles.outerContainer}>
      <Head>
        <link rel="preload" as="image" href="/images/background.jpg" />
      </Head>
      <div className={styles.backgroundImage} />
      <div data-theme="light">
        <PlayRadioButton />
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
