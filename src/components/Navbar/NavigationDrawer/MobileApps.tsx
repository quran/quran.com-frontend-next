import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';

import styles from './MobileApps.module.scss';
import NavigationDrawerItem from './NavigationDrawerItem';

import { MobileIcon } from 'src/components/Icons';

const MobileApps = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <NavigationDrawerItem title={t('mobile-apps')} icon={<MobileIcon />} isStale />
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
