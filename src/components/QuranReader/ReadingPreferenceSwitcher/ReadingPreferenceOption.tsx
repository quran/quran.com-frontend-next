import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import classNames from 'classnames';

import styles from '@/components/QuranReader/ReadingPreferenceSwitcher/ReadingPreference.module.scss';
import Spinner from '@/dls/Spinner/Spinner';
import { ReadingPreference } from 'types/QuranReader';
import ReaderIcon from '@/icons/collection.svg';
import BookOpen from '@/icons/book-open.svg';
import { isMobile } from '@/utils/responsive';

type Props = {
  readingPreference: ReadingPreference;
  selectedReadingPreference: ReadingPreference;
  iconsOnly?: boolean;
  isLoading: boolean;
};


export const readingPreferenceIcons = {
  [ReadingPreference.Reading]: <BookOpen />,
  [ReadingPreference.Translation]: <ReaderIcon />,
}

const LoadingSwitcher: React.FC<Props> = ({
  readingPreference,
  selectedReadingPreference,
  iconsOnly = false,
  isLoading,
}) => {
  const { t } = useTranslation('common');
  const showOnlyIconsOnMobile = isMobile() && iconsOnly
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
