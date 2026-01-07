import { useCallback } from 'react';

import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
  selectReadingPreferences,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { getVerseNumberFromKey } from '@/utils/verse';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { ReadingPreference } from 'types/QuranReader';

export enum SwitcherContext {
  SurahHeader = 'surah_header',
  ContextMenu = 'context_menu',
  MobileTabs = 'mobile_tabs',
}

interface UseReadingPreferenceSwitcherOptions {
  context: SwitcherContext;
}

interface UseReadingPreferenceSwitcherResult {
  readingPreference: ReadingPreference;
  switchReadingPreference: (newPreference: ReadingPreference) => void;
  isLoading: boolean;
}

/**
 * Hook for switching between reading preferences (Translation/Reading mode).
 *
 * When switching modes, uses the startingVerse query param for navigation
 * instead of pixel-based scroll restoration. This is necessary because
 * translation and reading modes use different virtualizer configurations:
 * - Translation mode: 1 verse = 1 virtuoso item
 * - Reading mode: 1 page (multiple verses) = 1 virtuoso item
 *
 * The useScrollToVirtualizedVerse hooks in ReadingView/TranslationView
 * handle scrolling to the correct position based on startingVerse.
 *
 * @param {UseReadingPreferenceSwitcherOptions} options - Configuration options
 * @returns {UseReadingPreferenceSwitcherResult} Hook result with state and switch function
 */
const useReadingPreferenceSwitcher = ({
  context,
}: UseReadingPreferenceSwitcherOptions): UseReadingPreferenceSwitcherResult => {
  const router = useRouter();
  const { readingPreference } = useSelector(selectReadingPreferences);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);

  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  const lastReadVerse = lastReadVerseKey.verseKey
    ? getVerseNumberFromKey(lastReadVerseKey.verseKey).toString()
    : undefined;

  const switchReadingPreference = useCallback(
    (newPreference: ReadingPreference) => {
      if (newPreference === readingPreference) return;

      // Prepare URL params
      const newQueryParams = { ...router.query };

      if (context === SwitcherContext.SurahHeader) {
        // In SurahHeader, user is at the top of the page, so remove startingVerse
        delete newQueryParams.startingVerse;
      } else {
        // For ContextMenu and MobileTabs, always set startingVerse to ensure
        // the virtualized scroll hooks navigate to the correct verse/page.
        // Default to verse 1 if no verse has been tracked yet.
        newQueryParams.startingVerse = lastReadVerse || '1';
      }

      const newUrlObject = {
        pathname: router.pathname,
        query: newQueryParams,
      };

      const updateReduxState = () => {
        onSettingsChange(
          'readingPreference',
          newPreference,
          setReadingPreference(newPreference),
          setReadingPreference(readingPreference),
          PreferenceGroup.READING,
        );
      };

      // Update URL with shallow routing (no page reload), then update Redux state.
      // The useScrollToVirtualizedVerse hooks in ReadingView/TranslationView
      // will handle scrolling to the correct position based on startingVerse.
      router
        .replace(newUrlObject, null, { shallow: true, scroll: false })
        .then(updateReduxState)
        .catch(updateReduxState); // Still update Redux if router fails to keep UI in sync
    },
    [context, lastReadVerse, onSettingsChange, readingPreference, router],
  );

  return {
    readingPreference,
    switchReadingPreference,
    isLoading,
  };
};

export default useReadingPreferenceSwitcher;
