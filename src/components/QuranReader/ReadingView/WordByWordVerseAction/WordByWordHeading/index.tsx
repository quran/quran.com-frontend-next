import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './WordByWordHeading.module.scss';

interface Props {
  isTranslation: boolean;
}

const WordByWordHeading: React.FC<Props> = ({ isTranslation }) => {
  const { t } = useTranslation('common');
  return (
    <p className={styles.heading}>
      {t(`wbw-${isTranslation ? 'translation' : 'transliteration'}`)}
    </p>
  );
};

export default WordByWordHeading;
