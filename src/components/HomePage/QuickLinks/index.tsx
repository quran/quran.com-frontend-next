import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import QuickLink from './QuickLink';
import styles from './QuickLinks.module.scss';

const QUICK_LINKS = [
  {
    slug: '67',
    key: 'mulk',
  },
  {
    slug: '36',
    key: 'yaseen',
  },
  {
    slug: '2/255',
    key: 'ayat-ul-kursi',
  },
  {
    slug: '18',
    key: 'kahf',
  },
  {
    slug: '56',
    key: 'waqiah',
  },
  // {
  //   slug: '55',
  //   key: 'rahman',
  // },
  // {
  //   slug: '73',
  //   key: 'muzzammil',
  // },
];

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
