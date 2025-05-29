import React from 'react';

import styles from './ReadingPreference.module.scss';

import ReadingIcon from '@/public/icons/reading.svg';
import TranslationIcon from '@/public/icons/translation-mode.svg';
import { ReadingPreference } from '@/types/QuranReader';

/**
 * Props for the ReadingPreferenceIcon component
 */
export interface ReadingPreferenceIconProps {
  /** The currently active reading preference in the application */
  currentReadingPreference: ReadingPreference;
  /** The reading preference option this component represents */
  optionReadingPreference: ReadingPreference;
}

/**
 * A component that returns the appropriate icon based on the current reading preference and the option being rendered
 *
 * @returns {JSX.Element} The appropriate icon component with transition support
 */
function ReadingPreferenceIcon({
  currentReadingPreference,
  optionReadingPreference,
}: ReadingPreferenceIconProps): JSX.Element {
  // Determine if this option is currently selected
  const isSelected = currentReadingPreference === optionReadingPreference;

  // Return the appropriate icon component based on the option type
  return optionReadingPreference === ReadingPreference.Reading ? (
    <ReadingIcon
      className={`${styles.readingIcon} ${isSelected ? styles.selected : styles.unselected}`}
    />
  ) : (
    <TranslationIcon
      className={`${styles.translationIcon} ${isSelected ? styles.selected : styles.unselected}`}
    />
  );
}

/**
 * For backward compatibility, maintain the function API
 *
 * @param {ReadingPreferenceIconProps} props - Component props
 * @returns {JSX.Element} The ReadingPreferenceIcon component
 */
export function getReadingPreferenceIcon(props: ReadingPreferenceIconProps): JSX.Element {
  return <ReadingPreferenceIcon {...props} />;
}

export default ReadingPreferenceIcon;
