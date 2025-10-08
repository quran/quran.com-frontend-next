import React from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import ReadingPreferenceOption from './ReadingPreferenceOption';
import styles from './ReadingPreferenceSwitcher.module.scss';

import Switch, { SwitchSize, SwitchVariant } from '@/dls/Switch/Switch';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useGetMushaf from '@/hooks/useGetMushaf';
import useScrollRestoration from '@/hooks/useScrollRestoration';
import { setLockVisibilityState } from '@/redux/slices/navbar';
import {
  selectReadingPreferences,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { Mushaf, ReadingPreference } from 'types/QuranReader';

/**
 * Enum for the different contexts where the reading preference switcher can be used
 */
export enum ReadingPreferenceSwitcherType {
  SurahHeader = 'surah_header',
  ContextMenu = 'context_menu',
}

/**
 * Props for the ReadingPreferenceSwitcher component
 */
type Props = {
  type: ReadingPreferenceSwitcherType;
  isIconsOnly?: boolean;
  size?: SwitchSize;
  variant?: SwitchVariant;
};

/**
 * Component for switching between different reading preferences (Translation/Reading)
 *
 * @param {object} props - Component props
 * @param {SwitchSize} [props.size] - Size of the switch component
 * @param {boolean} [props.isIconsOnly] - Whether to show only icons without text
 * @param {ReadingPreferenceSwitcherType} [props.type] - The context where this switcher is being used
 * @param {SwitchVariant} [props.variant] - Variant of the switch component
 * @returns {JSX.Element} React component for switching reading preferences
 */
const ReadingPreferenceSwitcher = ({
  type,
  isIconsOnly = false,
  size = SwitchSize.Normal,
  variant = SwitchVariant.Default,
}: Props) => {
  // Redux state
  const readingPreferences = useSelector(selectReadingPreferences);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const { readingPreference } = readingPreferences;

  // Hooks
  const router = useRouter();
  const mushaf = useGetMushaf();
  const dispatch = useDispatch();
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  // Extract verse number from the last read verse key
  const lastReadVerse = lastReadVerseKey.verseKey?.split(':')[1];

  /**
   * Generate the switch options for reading preferences
   * @returns {Array<{name: JSX.Element, value: ReadingPreference}>} Array of switch options
   */
  const readingPreferencesOptions = (): Array<{ name: JSX.Element; value: ReadingPreference }> => [
    {
      name: (
        <ReadingPreferenceOption
          readingPreference={readingPreference}
          selectedReadingPreference={ReadingPreference.Translation}
          isLoading={isLoading}
          isIconsOnly={isIconsOnly}
        />
      ),
      value: ReadingPreference.Translation,
    },
    {
      name: (
        <ReadingPreferenceOption
          readingPreference={readingPreference}
          selectedReadingPreference={ReadingPreference.Reading}
          isLoading={isLoading}
          isIconsOnly={isIconsOnly}
        />
      ),
      value: ReadingPreference.Reading,
    },
  ];

  // Use the shared scroll restoration hook
  const { restoreScrollPosition } = useScrollRestoration();

  /**
   * Handle switching between reading preferences
   *
   * @param {ReadingPreference} view - The new reading preference to switch to
   */
  /**
   * Prepares URL parameters for the reading preference change
   *
   * @returns {object} URL object with query parameters
   */
  const prepareUrlParams = () => {
    // Prepare URL parameters
    const newQueryParams = { ...router.query };

    // Handle starting verse based on context
    if (type === ReadingPreferenceSwitcherType.SurahHeader) {
      // In SurahHeader, we don't need to track the verse
      delete newQueryParams.startingVerse;
    } else if (parseInt(lastReadVerse, 10) > 1) {
      // In ContextMenu, we track the verse if we're not at the beginning
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
    // Update reading preference in Redux
    onSettingsChange(
      'readingPreference',
      view,
      setReadingPreference(view),
      setReadingPreference(readingPreference),
      PreferenceGroup.READING,
    );

    // Use the shared hook to restore scroll position and handle completion
    restoreScrollPosition(scrollPosition, isTranslationTab, () => {
      dispatch(setLockVisibilityState(false));
    });
  };

  const onViewSwitched = (view: ReadingPreference) => {
    // Log the change event
    logValueChange(`${type}_reading_preference`, readingPreference, view);

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

  // Determine container class names based on context and mushaf type
  const containerClassNames = classNames(styles.container, {
    [styles.surahHeaderContainer]: type === ReadingPreferenceSwitcherType.SurahHeader,
    [styles.contextMenuContainer]:
      type === ReadingPreferenceSwitcherType.ContextMenu && !isIconsOnly,
    [styles.contextMenuIconOnlyContainer]:
      type === ReadingPreferenceSwitcherType.ContextMenu && isIconsOnly,
    [styles.tajweedMushaf]:
      mushaf === Mushaf.QCFTajweedV4 && type === ReadingPreferenceSwitcherType.SurahHeader,
  });

  return (
    <div className={containerClassNames} id="reading-preference-switcher">
      <Switch
        items={readingPreferencesOptions()}
        selected={readingPreference}
        onSelect={onViewSwitched}
        size={size}
        variant={variant}
      />
    </div>
  );
};

export default ReadingPreferenceSwitcher;
