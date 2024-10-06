import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import NavigationDrawerItem from '../NavigationDrawerItem';

import styles from './NavigationDrawerBody.module.scss';

import FundraisingBanner from '@/components/Fundraising/FundraisingBanner';
import IconDevelopers from '@/icons/developers.svg';
import IconFeedback from '@/icons/feedback.svg';
import IconHome from '@/icons/home.svg';
import IconInfo from '@/icons/info.svg';
import IconLock from '@/icons/lock.svg';
import MobileIcon from '@/icons/mobile.svg';
import IconProductUpdates from '@/icons/product-updates.svg';
import IconQ from '@/icons/Q_simple.svg';
import QuranReflect from '@/icons/QR.svg';
import IconQuestionMark from '@/icons/question-mark.svg';
import IconRadio2 from '@/icons/radio-2.svg';
import IconRadio from '@/icons/radio.svg';
import Tarteel from '@/icons/tarteel.svg';
// import MobileApps from '../MobileApps';
import { logTarteelLinkClick } from '@/utils/eventLogger';

// import IconDonate from '@/icons/donate.svg';
// import IconUpdates from '@/icons/updates.svg';
// import IconCollection from '@/icons/collection.svg';

const NavigationDrawerBody = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.listItemsContainer}>
      <FundraisingBanner />
      <h3 className={styles.subtitle}>{t('menu')}</h3>
      <NavigationDrawerItem title={t('home')} icon={<IconHome />} href="/" />
      <NavigationDrawerItem href="/radio" title={t('quran-radio')} icon={<IconRadio2 />} />
      <NavigationDrawerItem href="/reciters" title={t('reciters')} icon={<IconRadio />} />
      <NavigationDrawerItem title={t('about')} icon={<IconInfo />} href="/about-us" />
      <NavigationDrawerItem title={t('mobile-apps')} icon={<MobileIcon />} href="/apps" />
      {/* <NavigationDrawerItem title="Updates" icon={<IconUpdates />} href="/updates" /> */}
      <NavigationDrawerItem title={t('developers')} icon={<IconDevelopers />} href="/developers" />
      {/* <NavigationDrawerItem title="Contribute" icon={<IconDonate />} href="/contribute" /> */}
      <NavigationDrawerItem title={t('privacy')} icon={<IconLock />} href="/privacy" />
      <NavigationDrawerItem
        title={t('terms-and-conditions')}
        icon={<IconProductUpdates />}
        href="/terms-and-conditions"
      />
      <NavigationDrawerItem
        title={t('product-updates')}
        icon={<IconProductUpdates />}
        href="/product-updates"
      />
      <NavigationDrawerItem
        title={t('feedback')}
        icon={<IconFeedback />}
        href="https://feedback.quran.com/"
        isExternalLink
      />
      <NavigationDrawerItem title={t('help')} icon={<IconQuestionMark />} href="/support" />
      {/* <h3 className={styles.subtitle}>Selected Collections</h3> */}
      {/* <NavigationDrawerItem title="Duaas" icon={<IconCollection />} /> */}
      {/* <NavigationDrawerItem title="Jewels of Quran" icon={<IconCollection />} /> */}
      {/* <NavigationDrawerItem title="Names of Allah" icon={<IconCollection />} /> */}
      {/* <NavigationDrawerItem title="Revelation" icon={<IconCollection />} />  */}
      <h3 className={styles.subtitle}>{t('network')}</h3>
      <NavigationDrawerItem
        title="Quranicaudio.com"
        icon={<IconQ />}
        href="https://quranicaudio.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Salah.com"
        icon={<IconQ />}
        href="https://salah.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Sunnah.com"
        icon={<IconQ />}
        href="https://sunnah.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Legacy.quran.com"
        icon={<IconQ />}
        href="https://legacy.quran.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Previous.quran.com"
        icon={<IconQ />}
        href="https://previous.quran.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Corpus.quran.com"
        icon={<IconQ />}
        href="https://corpus.quran.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="QuranReflect.com"
        icon={<QuranReflect />}
        href="https://quranreflect.com/"
        isExternalLink
      />
      <NavigationDrawerItem
        onClick={() => {
          logTarteelLinkClick('navigation_menu_network');
        }}
        isExternalLink
        title={t('tarteel.name')}
        icon={<Tarteel />}
        href="https://download.tarteel.ai/"
      />
    </div>
  );
};

export default NavigationDrawerBody;
