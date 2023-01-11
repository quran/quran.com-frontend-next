import React from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import styles from './LocalizationMessage.module.scss';

const LocalizationMessage = () => {
  const { t } = useTranslation('product-updates');
  const { locale } = useRouter();

  if (locale === 'en') {
    return <></>;
  }
  return <div className={styles.container}>{t('localization-message')}</div>;
};

export default LocalizationMessage;
