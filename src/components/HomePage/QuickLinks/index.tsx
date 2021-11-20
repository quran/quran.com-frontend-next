import React from 'react';

import QuickLink from './QuickLink';
import styles from './QuickLinks.module.scss';

const QUICK_LINKS = [
  {
    slug: '2/255',
    text: 'Ayatul Kursi',
  },
  {
    slug: '36',
    text: 'Surah Yaseen',
  },
  {
    slug: '67',
    text: 'Surah Al Mulk',
  },
  {
    slug: '55',
    text: 'Surah Ar-Rahman',
  },
  {
    slug: '56',
    text: "Surah Al Waqi'ah",
  },
  {
    slug: '18',
    text: 'Surah Al Kahf',
  },
  {
    slug: '73',
    text: 'Surah Al Muzzammil',
  },
];

const QuickLinks: React.FC = () => (
  <div className={styles.quickLinksContainer}>
    {QUICK_LINKS.map((quickLink) => (
      <QuickLink
        key={quickLink.slug}
        slug={quickLink.slug}
        text={quickLink.text}
        className={styles.link}
      />
    ))}
  </div>
);

export default QuickLinks;
