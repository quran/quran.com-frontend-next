import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import QuickLink from './QuickLink';
import styles from './QuickLinks.module.scss';

import { isLoggedIn } from '@/utils/auth/login';

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

const QUICK_LINKS = [
  {
    slug: 'about-the-quran',
    logKey: 'about-quran',
    key: 'about-quran',
  },
  {
    slug: 'surah-al-mulk',
    logKey: 'surah-al-mulk',
    key: 'mulk',
  },
  {
    slug: 'surah-ya-sin',
    logKey: 'surah-ya-sin',
    key: 'yaseen',
  },
  {
    slug: 'surah-al-kahf',
    logKey: 'surah-al-kahf',
    key: 'kahf',
  },
  {
    slug: 'surah-al-waqiah',
    logKey: 'surah-al-waqiah',
    key: 'waqiah',
  },
];

// TODO: this is temporary and needs to be updated.
if (isLoggedIn() && isProduction) {
  QUICK_LINKS.push({
    slug: 'collections/the-authority-and-importance-of-the-sunnah-clem7p7lf15921610rsdk4xzulfj',
    key: 'sunnah',
    logKey: 'sunnah_collection',
  });
}

const QuickLinks: React.FC = () => {
  const { t } = useTranslation('quick-links');

  return (
    <div className={styles.quickLinksContainer}>
      {QUICK_LINKS.map((quickLink) => (
        <QuickLink
          key={quickLink.slug}
          slug={quickLink.slug}
          logKey={quickLink.logKey}
          text={t(quickLink.key)}
          className={styles.link}
        />
      ))}
    </div>
  );
};

export default QuickLinks;
