import React from 'react';

import useTranslation from 'next-translate/useTranslation';

// import MobileApps from '../MobileApps';
import NavigationDrawerItem from '../NavigationDrawerItem';

import styles from './NavigationDrawerBody.module.scss';

import {
  DevelopersIcon,
  FeedbackIcon,
  HomeIcon,
  InfoIcon,
  LockIcon,
  MobileIcon,
  ProductUpdatesIcon,
  QSimpleIcon,
  QuranReflectIcon,
  QuestionMarkIcon,
  Radio2Icon,
  TarteelIcon,
} from 'src/components/Icons';
import { logTarteelLinkClick } from 'src/utils/eventLogger';

// import { DonateIcons, UpdatesIcon, CollectionIcon } from 'src/components/Icons';

const NavigationDrawerBody = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.listItemsContainer}>
      <h3 className={styles.subtitle}>{t('menu')}</h3>
      <NavigationDrawerItem title={t('home')} icon={<HomeIcon />} href="/" />
      <NavigationDrawerItem href="/radio" title={t('quran-radio')} icon={<Radio2Icon />} />
      <NavigationDrawerItem title={t('about')} icon={<InfoIcon />} href="/about-us" />
      <NavigationDrawerItem title={t('mobile-apps')} icon={<MobileIcon />} href="/apps" />
      {/* <NavigationDrawerItem title="Updates" icon={<UpdatesIcon />} href="/updates" /> */}
      <NavigationDrawerItem title={t('developers')} icon={<DevelopersIcon />} href="/developers" />
      {/* <NavigationDrawerItem title="Contribute" icon={<DonateIcons />} href="/contribute" /> */}
      <NavigationDrawerItem title={t('privacy')} icon={<LockIcon />} href="/privacy" />
      <NavigationDrawerItem
        title={t('product-updates')}
        icon={<ProductUpdatesIcon />}
        href="/product-updates"
      />
      <NavigationDrawerItem
        title={t('feedback')}
        icon={<FeedbackIcon />}
        href="https://feedback.quran.com/"
        isExternalLink
      />
      <NavigationDrawerItem title={t('help')} icon={<QuestionMarkIcon />} href="/support" />
      {/* <h3 className={styles.subtitle}>Selected Collections</h3> */}
      {/* <NavigationDrawerItem title="Duaas" icon={<CollectionIcon />} /> */}
      {/* <NavigationDrawerItem title="Jewels of Quran" icon={<CollectionIcon />} /> */}
      {/* <NavigationDrawerItem title="Names of Allah" icon={<CollectionIcon />} /> */}
      {/* <NavigationDrawerItem title="Revelation" icon={<CollectionIcon />} />  */}
      <h3 className={styles.subtitle}>{t('network')}</h3>
      <NavigationDrawerItem
        title="Quranicaudio.com"
        icon={<QSimpleIcon />}
        href="https://quranicaudio.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Salah.com"
        icon={<QSimpleIcon />}
        href="https://salah.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Sunnah.com"
        icon={<QSimpleIcon />}
        href="https://sunnah.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Legacy.quran.com"
        icon={<QSimpleIcon />}
        href="https://legacy.quran.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Previous.quran.com"
        icon={<QSimpleIcon />}
        href="https://previous.quran.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Corpus.quran.com"
        icon={<QSimpleIcon />}
        href="https://corpus.quran.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="QuranReflect.com"
        icon={<QuranReflectIcon />}
        href="https://quranreflect.com/"
        isExternalLink
      />
      <NavigationDrawerItem
        onClick={() => {
          logTarteelLinkClick('navigation_menu_network');
        }}
        isExternalLink
        title={t('tarteel.name')}
        icon={<TarteelIcon />}
        href="https://download.tarteel.ai/"
      />
    </div>
  );
};

export default NavigationDrawerBody;
