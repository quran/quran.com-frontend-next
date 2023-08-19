import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/QuranReader/ReadingPreferenceSwitcher/ReadingPreference.module.scss';
import Spinner from '@/dls/Spinner/Spinner';
import BookOpen from '@/icons/book-open.svg';
import ReaderIcon from '@/icons/collection.svg';
import { isMobile } from '@/utils/responsive';
import { ReadingPreference } from 'types/QuranReader';

type Props = {
  readingPreference: ReadingPreference;
  selectedReadingPreference: ReadingPreference;
  isIconsOnly?: boolean;
  isLoading: boolean;
};

export const readingPreferenceIcons = {
  [ReadingPreference.Reading]: <BookOpen />,
  [ReadingPreference.Translation]: <ReaderIcon />,
};

const LoadingSwitcher: React.FC<Props> = ({
  readingPreference,
  selectedReadingPreference,
  isIconsOnly = false,
  isLoading,
}) => {
  const { t } = useTranslation('common');
  const showOnlyIconsOnMobile = isMobile() && isIconsOnly;
  return isLoading && readingPreference === selectedReadingPreference ? (
    <div className={styles.container}>
      <span>
        <Spinner className={styles.spinner} />
      </span>
      <span>{t(`reading-preference.${readingPreference}`)}</span>
    </div>
  ) : (
    <div className={styles.container}>
      <span
        className={classNames(styles.iconContainer, showOnlyIconsOnMobile && styles.iconsCenter)}
      >
        {readingPreferenceIcons[selectedReadingPreference]}
      </span>
      {!showOnlyIconsOnMobile && (
        <span className={styles.themeNameContainer}>
          {t(`reading-preference.${selectedReadingPreference}`)}
        </span>
      )}
    </div>
  );
};

export default LoadingSwitcher;
