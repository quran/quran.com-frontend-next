import React from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import readingPreferenceStyles from '../../ReadingPreferenceSwitcher/ReadingPreference.module.scss';
import styles from '../styles/MobileReadingTabs.module.scss';

import { Tab } from '@/components/dls/Tabs/Tabs';
import { getReadingPreferenceIcon } from '@/components/QuranReader/ReadingPreferenceSwitcher/ReadingPreferenceIcon';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { setLockVisibilityState } from '@/redux/slices/navbar';
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
  const dispatch = useDispatch();
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
  /**
   * Handles the translation tab's scrolling issues by using a MutationObserver
   *
   * @param {number} scrollPosition - The scroll position to maintain
   */
  const handleTranslationTabScroll = (scrollPosition: number) => {
    // Create a MutationObserver to detect DOM changes and maintain scroll position
    const observer = new MutationObserver(() => {
      window.scrollTo(0, scrollPosition);
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Stop observing after a short period to allow initial rendering
    setTimeout(() => {
      observer.disconnect();
      window.scrollTo(0, scrollPosition);
    }, 500);
  };

  /**
   * Prepares URL parameters for the reading preference change
   *
   * @returns {object} URL object with query parameters
   */
  const prepareUrlParams = () => {
    // Prepare URL parameters
    const newQueryParams = { ...router.query };

    // Handle starting verse based on context
    if (parseInt(lastReadVerse, 10) > 1) {
      // Track the verse if we're not at the beginning
      newQueryParams.startingVerse = lastReadVerse;
    }

    // Create the new URL object
    return {
      pathname: router.pathname,
      query: newQueryParams,
    };
  };

  /**
   * Handle the post-navigation tasks after the URL has been updated
   *
   * @param {ReadingPreference} view - The new reading preference
   * @param {number} scrollPosition - The scroll position to maintain
   * @param {boolean} isTranslationTab - Whether this is the translation tab
   */
  const handlePostNavigation = (
    view: ReadingPreference,
    scrollPosition: number,
    isTranslationTab: boolean,
  ) => {
    // Restore scroll position after navigation
    window.scrollTo(0, scrollPosition);

    // For translation tab, apply special handling
    if (isTranslationTab) {
      handleTranslationTabScroll(scrollPosition);
    }

    // Update reading preference in Redux
    onSettingsChange(
      'readingPreference',
      view,
      setReadingPreference(view),
      setReadingPreference(readingPreference),
      PreferenceGroup.READING,
    );

    // Unlock navbar visibility state after a delay to ensure all changes are complete
    setTimeout(() => {
      dispatch(setLockVisibilityState(false));
      // Make sure scroll position is maintained
      window.scrollTo(0, scrollPosition);
    }, 500); // Use a longer delay to ensure stability with translation tab
  };

  const onViewSwitched = (view: ReadingPreference) => {
    // Log the change event
    logValueChange('mobile_tabs_reading_preference', readingPreference, view);

    // Lock navbar visibility state to prevent flickering during tab switching
    dispatch(setLockVisibilityState(true));

    // Save current scroll position
    const scrollPosition = window.scrollY;

    // Check if this is the translation tab which tends to cause scrolling
    const isTranslationTab = view === ReadingPreference.Translation;

    // Get URL parameters for the navigation
    const newUrlObject = prepareUrlParams();

    // Update the URL and then handle post-navigation tasks
    router.replace(newUrlObject, null, { shallow: true, scroll: false }).then(() => {
      handlePostNavigation(view, scrollPosition, isTranslationTab);
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
