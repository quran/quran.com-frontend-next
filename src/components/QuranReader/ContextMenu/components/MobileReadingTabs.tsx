import React from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import readingPreferenceStyles from '../../ReadingPreferenceSwitcher/ReadingPreference.module.scss';
import styles from '../styles/MobileReadingTabs.module.scss';

import { Tab } from '@/components/dls/Tabs/Tabs';
import { getReadingPreferenceIcon } from '@/components/QuranReader/ReadingPreferenceSwitcher/ReadingPreferenceIcon';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
  selectReadingPreferences,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { logValueChange } from '@/utils/eventLogger';
import { getVerseNumberFromKey } from '@/utils/verse';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { ReadingPreference } from 'types/QuranReader';

interface MobileReadingTabsProps {
  t: (key: string) => string;
}

/**
 * Mobile-specific tabs for switching between reading preferences
 * Appears only on mobile breakpoints when the navbar is visible
 *
 * @param {object} props - Component props
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element} React component for mobile reading preference tabs
 */
const MobileReadingTabs: React.FC<MobileReadingTabsProps> = ({ t }) => {
  // Redux state
  const readingPreferences = useSelector(selectReadingPreferences);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const { readingPreference } = readingPreferences;

  // Hooks
  const router = useRouter();
  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();

  const lastReadVerse = lastReadVerseKey.verseKey
    ? getVerseNumberFromKey(lastReadVerseKey.verseKey).toString()
    : undefined;

  // Define tabs with icons
  const tabs: Tab[] = [
    {
      title: t('reading-preference.translation'),
      value: ReadingPreference.Translation,
      id: 'translation-tab',
    },
    {
      title: t('reading-preference.reading'),
      value: ReadingPreference.Reading,
      id: 'reading-tab',
    },
  ];

  /**
   * Handle switching between reading preferences
   *
   * @param {ReadingPreference} view - The new reading preference to switch to
   */
  const onViewSwitched = (view: ReadingPreference) => {
    // Log the change event
    logValueChange('mobile_tabs_reading_preference', readingPreference, view);

    // Prepare URL parameters
    const newQueryParams = { ...router.query };

    // Handle starting verse based on context
    if (parseInt(lastReadVerse, 10) > 1) {
      // Track the verse if we're not at the beginning
      newQueryParams.startingVerse = lastReadVerse;
    }

    // Create the new URL object
    const newUrlObject = {
      pathname: router.pathname,
      query: newQueryParams,
    };

    // Update the URL and then update the reading preference in Redux
    router.replace(newUrlObject, null, { shallow: true }).then(() => {
      onSettingsChange(
        'readingPreference',
        view,
        setReadingPreference(view),
        setReadingPreference(readingPreference),
        PreferenceGroup.READING,
      );
    });
  };

  // Custom tab rendering to include icons
  const renderTabs = () => {
    return (
      <div className={styles.tabsContainer} role="tablist">
        {tabs.map((tab) => (
          <div
            className={classNames(
              styles.tab,
              readingPreference === tab.value && styles.selectedTab,
            )}
            key={tab.value}
            role="tab"
            tabIndex={0}
            id={tab.id}
            onClick={() => onViewSwitched(tab.value as ReadingPreference)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                onViewSwitched(tab.value as ReadingPreference);
              }
            }}
          >
            <>
              <span className={readingPreferenceStyles.iconContainer}>
                {getReadingPreferenceIcon({
                  currentReadingPreference: readingPreference,
                  optionReadingPreference: tab.value as ReadingPreference,
                  useSuccessVariant: true,
                })}
              </span>
              <span>{tab.title}</span>
            </>
          </div>
        ))}
      </div>
    );
  };

  return <div className={styles.container}>{renderTabs()}</div>;
};

export default MobileReadingTabs;
