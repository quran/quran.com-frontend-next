import React from 'react';

import classNames from 'classnames';

import styles from '../styles/MobileReadingTabs.module.scss';

import useReadingPreferenceSwitcher, {
  SwitcherContext,
} from '@/hooks/useReadingPreferenceSwitcher';
import ReadingModeIcon from '@/public/icons/reading-mode.svg';
import VerseByVerseIcon from '@/public/icons/verse-by-verse.svg';
import { TestId } from '@/tests/test-ids';
import { logValueChange } from '@/utils/eventLogger';
import isInReadingMode from '@/utils/readingPreference';
import { ReadingPreference } from 'types/QuranReader';

interface MobileReadingTabsProps {
  t: (key: string) => string;
  isVisible?: boolean;
}

/**
 * Mobile-specific tabs for switching between reading preferences.
 * Appears only on mobile breakpoints when the navbar is visible.
 *
 * Shows two main tabs: "Verse by Verse" and "Reading"
 * When "Reading" is selected, clicking it shows the current sub-mode (Arabic/Translation)
 *
 * @returns {JSX.Element} React component for mobile reading preference tabs
 */
const MobileReadingTabs: React.FC<MobileReadingTabsProps> = ({ t, isVisible = true }) => {
  const { readingPreference, switchReadingPreference } = useReadingPreferenceSwitcher({
    context: SwitcherContext.MobileTabs,
  });

  // Determine if we're in a "Reading" mode (either Arabic or Translation)
  const isReadingMode = isInReadingMode(readingPreference);

  const isVerseByVerseSelected = readingPreference === ReadingPreference.Translation;

  const handleVerseByVerseClick = () => {
    if (isVerseByVerseSelected) return;
    logValueChange(
      'mobile_tabs_reading_preference',
      readingPreference,
      ReadingPreference.Translation,
    );
    switchReadingPreference(ReadingPreference.Translation);
  };

  const handleReadingClick = () => {
    if (isReadingMode) return;
    // Default to Arabic when entering Reading mode
    logValueChange('mobile_tabs_reading_preference', readingPreference, ReadingPreference.Reading);
    switchReadingPreference(ReadingPreference.Reading);
  };

  return (
    <div className={styles.container}>
      <div
        className={classNames(styles.tabsContainer, {
          [styles.tabsContainerVisible]: isVisible,
        })}
        role="tablist"
      >
        <div
          className={classNames(styles.tab, isVerseByVerseSelected && styles.selectedTab)}
          role="tab"
          tabIndex={0}
          id="verse-by-verse-tab"
          data-testid={TestId.TRANSLATION_TAB}
          data-is-selected={isVerseByVerseSelected}
          aria-selected={isVerseByVerseSelected}
          onClick={handleVerseByVerseClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              handleVerseByVerseClick();
            }
          }}
        >
          <span className={styles.iconContainer}>
            <VerseByVerseIcon className={styles.icon} />
          </span>
          <span>{t('reading-preference.verse-by-verse')}</span>
        </div>

        <div
          className={classNames(styles.tab, isReadingMode && styles.selectedTab)}
          role="tab"
          tabIndex={0}
          id="reading-tab"
          data-testid={TestId.READING_TAB}
          data-is-selected={isReadingMode}
          aria-selected={isReadingMode}
          onClick={handleReadingClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              handleReadingClick();
            }
          }}
        >
          <span className={styles.iconContainer}>
            <ReadingModeIcon className={styles.icon} />
          </span>
          <span>{t('reading-preference.reading')}</span>
        </div>
      </div>
    </div>
  );
};

export default MobileReadingTabs;
