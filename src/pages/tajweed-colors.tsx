import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './tajweedColors.module.scss';

import NextSeoWrapper from 'src/components/NextSeoWrapper';

const TAJWEED_COLORS = ['edgham', 'mad-2', 'mad-2-4-6', 'mad-4-5', 'mad-6', 'ekhfa', 'qalqala'];

const TajweedColors = () => {
  const { t } = useTranslation('tajweed');
  return (
    <>
      <NextSeoWrapper title={t('tajweed-header')} />
      <div className={styles.container}>
        <p className={styles.header}>{t('tajweed-header')}</p>
        {TAJWEED_COLORS.map((color) => (
          <div className={styles.colorContainer} key={color}>
            <div className={classNames(styles.circle, styles[color])} />
            <p>{t(color)}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default TajweedColors;
