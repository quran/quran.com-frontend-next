import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import NavigationDrawerItem from '../NavigationDrawerItem';

import styles from './NavigationDrawerBody.module.scss';

import FundraisingBanner from '@/components/Fundraising/FundraisingBanner';
import IconDevelopers from '@/icons/developers.svg';
import IconFeedback from '@/icons/feedback.svg';
import IconHome from '@/icons/home.svg';
import IconInfo from '@/icons/info.svg';
import IconProductUpdates from '@/icons/product-updates.svg';
import IconQ from '@/icons/Q_simple.svg';
import QuranReflect from '@/icons/QR.svg';
import IconQuestionMark from '@/icons/question-mark.svg';
import IconRadio2 from '@/icons/radio-2.svg';
import IconRadio from '@/icons/radio.svg';

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
      <NavigationDrawerItem title={t('developers')} icon={<IconDevelopers />} href="/developers" />
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
      <h3 className={styles.subtitle}>{t('our-projects')}</h3>
      <p className={styles.projectsDesc}>{t('projects-desc')}</p>
      <NavigationDrawerItem
        title="Quran.com"
        icon={<IconQ />}
        href="https://quran.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Quran For Android"
        icon={<IconQ />}
        href="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&hl=en&pli=1 "
        isExternalLink
      />
      <NavigationDrawerItem
        title="Quran iOS"
        icon={<IconQ />}
        href="https://apps.apple.com/us/app/quran-by-quran-com-%D9%82%D8%B1%D8%A2%D9%86/id1118663303 "
        isExternalLink
      />
      <NavigationDrawerItem
        title="QuranReflect.com"
        icon={<QuranReflect />}
        href="https://quranreflect.com/"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Sunnah.com"
        icon={<IconQ />}
        href="https://sunnah.com/"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Nuqayah.com"
        icon={<IconQ />}
        href="https://nuqayah.com/"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Legacy.quran.com"
        icon={<IconQ />}
        href="https://legacy.quran.com"
        isExternalLink
      />
      <NavigationDrawerItem
        title="Corpus.quran.com"
        icon={<IconQ />}
        href="https://corpus.quran.com"
        isExternalLink
      />
    </div>
  );
};

export default NavigationDrawerBody;
