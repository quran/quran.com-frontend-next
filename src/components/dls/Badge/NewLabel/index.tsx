import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NewLabel.module.scss';

const NewLabel = () => {
  const { t } = useTranslation('common');
  return <span className={styles.label}>{t('new')}</span>;
};

export default NewLabel;
