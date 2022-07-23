import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import { FiTerminal } from 'react-icons/fi';
import { FiMessageSquare } from 'react-icons/fi';
import { FiHome } from 'react-icons/fi';
import { FiInfo } from 'react-icons/fi';
import { FiLock } from 'react-icons/fi';
import { FiSmartphone } from 'react-icons/fi';
import { FiLoader } from 'react-icons/fi';
import { FiHelpCircle } from 'react-icons/fi';
import { FiRadio } from 'react-icons/fi';
import { FiRss } from 'react-icons/fi';
import IconQ from 'src/components/Icons/Quran/Quran';
import QuranReflect  from 'src/components/Icons/QuranReflection/QuranReflection';
import { Tarteel } from 'src/components/Icons/Tarteel/Tarteel';
// import MobileApps from '../MobileApps';
import NavigationDrawerItem from '../NavigationDrawerItem';

import styles from './NavigationDrawerBody.module.scss';

import FundraisingBanner from 'src/components/Fundaraising/FundraisingBanner';
import { logTarteelLinkClick } from 'src/utils/eventLogger';

// import { IconDonate } from 'react-icons/fi';
// import { IconUpdates } from 'react-icons/fi';
// import { IconCollection } from 'react-icons/fi';

const NavigationDrawerBody = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.listItemsContainer}>
      <FundraisingBanner />
      <h3 className={styles.subtitle}>{t('menu')}</h3>
      <NavigationDrawerItem title={t('home')} icon={<FiHome />} href="/" />
      <NavigationDrawerItem
        href="/radio"
        title={t('quran-radio')}
        icon={<FiRadio />}
      />
      <NavigationDrawerItem
        href="/reciters"
        title={t('reciters')}
        icon={<FiRss />}
      />
      <NavigationDrawerItem
        title={t('about')}
        icon={<FiInfo />}
        href="/about-us"
      />
      <NavigationDrawerItem
        title={t('mobile-apps')}
        icon={<FiSmartphone />}
        href="/apps"
      />
      {/* <NavigationDrawerItem title="Updates" icon={<IconUpdates />} href="/updates" /> */}
      <NavigationDrawerItem
        title={t('developers')}
        icon={<FiTerminal />}
        href="/developers"
      />
      {/* <NavigationDrawerItem title="Contribute" icon={<IconDonate />} href="/contribute" /> */}
      <NavigationDrawerItem
        title={t('privacy')}
        icon={<FiLock />}
        href="/privacy"
      />
      <NavigationDrawerItem
        title={t('product-updates')}
        icon={<FiLoader />}
        href="/product-updates"
      />
      <NavigationDrawerItem
        title={t('feedback')}
        icon={<FiMessageSquare />}
        href="https://feedback.quran.com/"
        isExternalLink
      />
      <NavigationDrawerItem
        title={t('help')}
        icon={<FiHelpCircle />}
        href="/support"
      />
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
