import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingPreference.module.scss';
import ReadingPreferenceIcon from './ReadingPreferenceIcon';

import Spinner from '@/dls/Spinner/Spinner';
import { ReadingPreference } from '@/types/QuranReader';

/**
 * Props for the ReadingPreferenceOption component
 */
interface ReadingPreferenceOptionProps {
  /** The currently active reading preference in the application */
  readingPreference: ReadingPreference;
  /** The reading preference option this component represents */
  selectedReadingPreference: ReadingPreference;
  /** Whether to show only icons without text labels */
  isIconsOnly?: boolean;
  /** Whether the reading preference is currently being changed/loaded */
  isLoading: boolean;
}

/**
 * Component that displays a reading preference option with loading state support
 *
 * This component renders either a loading spinner (when the option is being loaded)
 * or the appropriate icon for the reading preference option. It also optionally
 * displays a text label for the option.
 *
 * @param {ReadingPreferenceOptionProps} props - Component props
 * @returns {JSX.Element} The reading preference option with appropriate icon and loading state
 */
function ReadingPreferenceOption({
  readingPreference,
  selectedReadingPreference,
  isIconsOnly = false,
  isLoading,
}: ReadingPreferenceOptionProps): JSX.Element {
  const { t } = useTranslation('common');

  return isLoading ? (
    <div className={styles.container}>
      <span className={classNames(styles.iconContainer, isIconsOnly && styles.iconsCenter)}>
        <Spinner />
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
        <ReadingPreferenceIcon
          currentReadingPreference={readingPreference}
          optionReadingPreference={selectedReadingPreference}
        />
      </span>
      {!isIconsOnly && (
        <span
          className={classNames(
            styles.preferenceTextContainer,
            readingPreference !== selectedReadingPreference && styles.unselected,
          )}
        >
          {t(`reading-preference.${selectedReadingPreference}`)}
        </span>
      )}
    </div>
  );
}

export default ReadingPreferenceOption;
