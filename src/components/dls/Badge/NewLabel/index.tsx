import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NewLabel.module.scss';

const NewLabel = () => {
  const { t } = useTranslation('common');
  return <p className={styles.label}>{t('new')}</p>;
};

export default NewLabel;
