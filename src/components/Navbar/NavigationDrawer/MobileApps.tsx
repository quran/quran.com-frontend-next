import React from 'react';
import Image from 'next/image';
import NavigationDrawerItem from './NavigationDrawerItem';
import IconMobile from '../../../../public/icons/mobile.svg';
import styles from './MobileApps.module.scss';

const MobileApps = () => {
  return (
    <div className={styles.container}>
      <NavigationDrawerItem title="Mobile Apps" icon={<IconMobile />} isStale />
      <div className={styles.centerHorizontally}>
        <div className={styles.imagesContainer}>
          <a
            href="https://itunes.apple.com/us/app/quran-by-quran.com-qran/id1118663303"
            target="_blank"
            rel="noreferrer"
          >
            <Image src="/images/app-store.svg" width={135} height={40} />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&utm_source=quran-com&utm_campaign=download"
            target="_blank"
            rel="noreferrer"
          >
            <Image src="/images/play-store.svg" width={135} height={40} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileApps;
