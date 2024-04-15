/* eslint-disable i18next/no-literal-string */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/RamadanActivity/RamadanActivityHero/Hero.module.scss';

const QuranicCalendarHero = () => {
  const { t } = useTranslation('quranic-calendar');
  return (
    <div className={styles.container} dir="ltr">
      <div className={styles.rowContainer}>
        <div className={styles.row}>
          <p className={styles.header}>{t('quranic-calendar')}</p>
          <div className={styles.desc}>{t('hero.line-1')}</div>
        </div>
      </div>
    </div>
  );
};

export default QuranicCalendarHero;
