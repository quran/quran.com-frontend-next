import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../RenderControls.module.scss';

type Props = {
  data?: { count: number; limit: number };
};

const MonthlyMediaFileCounter: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation('quran-media-maker');

  if (data) {
    return (
      <p className={styles.text}>
        <span>{t('monthly-balance')}</span>
        <span>{t('count', { count: data?.count })}</span>
        <span>{t('limit', { limit: data?.limit })}</span>
      </p>
    );
  }
  return <></>;
};

export default MonthlyMediaFileCounter;
