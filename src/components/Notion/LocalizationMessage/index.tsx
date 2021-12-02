import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './LocalizationMessage.module.scss';

const LocalizationMessage = () => {
  const { t, lang } = useTranslation('product-updates');
  if (lang === 'en') {
    return <></>;
  }
  return <div className={styles.container}>{t('localization-message')}</div>;
};

export default LocalizationMessage;
