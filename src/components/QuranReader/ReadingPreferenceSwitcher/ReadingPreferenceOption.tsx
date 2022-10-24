import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/QuranReader/ReadingPreferenceSwitcher/ReadingPreference.module.scss';
import Spinner from '@/dls/Spinner/Spinner';
import { ReadingPreference } from 'types/QuranReader';

type Props = {
  readingPreference: ReadingPreference;
  selectedReadingPreference: ReadingPreference;
  isLoading: boolean;
};

const LoadingSwitcher: React.FC<Props> = ({
  readingPreference,
  selectedReadingPreference,
  isLoading,
}) => {
  const { t } = useTranslation('common');
  return isLoading && readingPreference === selectedReadingPreference ? (
    <div className={styles.container}>
      <span>
        <Spinner className={styles.spinner} />
      </span>
      <span>{t(`reading-preference.${readingPreference}`)}</span>
    </div>
  ) : (
    t(`reading-preference.${selectedReadingPreference}`)
  );
};

export default LoadingSwitcher;
