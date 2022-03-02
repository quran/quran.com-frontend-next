import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import IconDevelopers from '../../../../../public/icons/developers.svg';
import IconFeedback from '../../../../../public/icons/feedback.svg';
import IconHome from '../../../../../public/icons/home.svg';
import IconInfo from '../../../../../public/icons/info.svg';
import IconLock from '../../../../../public/icons/lock.svg';
import MobileIcon from '../../../../../public/icons/mobile.svg';
import IconProductUpdates from '../../../../../public/icons/product-updates.svg';
import IconQ from '../../../../../public/icons/Q_simple.svg';
import QuranReflect from '../../../../../public/icons/QR.svg';
import IconQuestionMark from '../../../../../public/icons/question-mark.svg';
import IconRadio2 from '../../../../../public/icons/radio-2.svg';
import Tarteel from '../../../../../public/icons/tarteel.svg';
// import MobileApps from '../MobileApps';
import NavigationDrawerItem from '../NavigationDrawerItem';

import styles from './NavigationDrawerBody.module.scss';

import { logTarteelLinkClick } from 'src/utils/eventLogger';

// import IconDonate from '../../../../../public/icons/donate.svg';
// import IconUpdates from '../../../../../public/icons/updates.svg';
// import IconCollection from '../../../../../public/icons/collection.svg';

const NavigationDrawerBody = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.listItemsContainer}>
      <h3 className={styles.subtitle}>{t('menu')}</h3>
      <NavigationDrawerItem title={t('home')} icon={<IconHome />} href="/" />
      <NavigationDrawerItem href="/radio" title={t('quran-radio')} icon={<IconRadio2 />} />
      <NavigationDrawerItem title={t('about')} icon={<IconInfo />} href="/about-us" />
      <NavigationDrawerItem title={t('mobile-apps')} icon={<MobileIcon />} href="/apps" />
      {/* <NavigationDrawerItem title="Updates" icon={<IconUpdates />} href="/updates" /> */}
      <NavigationDrawerItem title={t('developers')} icon={<IconDevelopers />} href="/developers" />
      {/* <NavigationDrawerItem title="Contribute" icon={<IconDonate />} href="/contribute" /> */}
      <NavigationDrawerItem title={t('privacy')} icon={<IconLock />} href="/privacy" />
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
