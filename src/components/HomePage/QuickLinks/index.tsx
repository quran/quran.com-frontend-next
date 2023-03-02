import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import QuickLink from './QuickLink';
import styles from './QuickLinks.module.scss';

import { isLoggedIn } from '@/utils/auth/login';

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

const QUICK_LINKS = [
  {
    slug: 'surah-al-mulk',
    key: 'mulk',
  },
  {
    slug: 'surah-ya-sin',
    key: 'yaseen',
  },
  {
    slug: 'ayatul-kursi',
    key: 'ayat-ul-kursi',
  },
  {
    slug: 'surah-al-kahf',
    key: 'kahf',
  },
  {
    slug: 'surah-al-waqiah',
    key: 'waqiah',
  },
];

// TODO: this is temporary and needs to be updated.
if (isLoggedIn() && isProduction) {
  QUICK_LINKS.push({
    slug: 'collections/the-authority-and-importance-of-the-sunnah-clem7p7lf15921610rsdk4xzulfj',
    key: 'sunnah',
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
          text={t(quickLink.key)}
          className={styles.link}
        />
      ))}
    </div>
  );
};

export default QuickLinks;
