import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/QuranReader/ReadingPreferenceSwitcher/ReadingPreference.module.scss';
import Spinner from '@/dls/Spinner/Spinner';
import BookIcon from '@/icons/book.svg';
import ReaderIcon from '@/icons/reader.svg';
import { ReadingPreference } from 'types/QuranReader';

type Props = {
  readingPreference: ReadingPreference;
  selectedReadingPreference: ReadingPreference;
  isIconsOnly?: boolean;
  isLoading: boolean;
};

export const readingPreferenceIcons = {
  [ReadingPreference.Reading]: <ReaderIcon />,
  [ReadingPreference.Translation]: <BookIcon />,
};

const LoadingSwitcher: React.FC<Props> = ({
  readingPreference,
  selectedReadingPreference,
  isIconsOnly = false,
  isLoading,
}) => {
  const { t } = useTranslation('common');
  return isLoading && readingPreference === selectedReadingPreference ? (
    <div className={styles.container}>
      <span>
        <Spinner className={styles.spinner} />
      </span>
      {!isIconsOnly && (
        <span className={styles.preferenceTextContainer}>
          {t(`reading-preference.${selectedReadingPreference}`)}
        </span>
      )}
    </div>
  ) : (
    <div className={styles.container}>
      <span className={classNames(styles.iconContainer, isIconsOnly && styles.iconsCenter)}>
        {readingPreferenceIcons[selectedReadingPreference]}
      </span>
      {!isIconsOnly && (
        <span className={styles.preferenceTextContainer}>
          {t(`reading-preference.${selectedReadingPreference}`)}
        </span>
      )}
    </div>
  );
};

export default LoadingSwitcher;
