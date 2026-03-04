import { useCallback } from 'react';

import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { markUserSwitchedReadingMode, resetUserSwitchFlag } from '@/hooks/readingModeSwitchTracker';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import {
  selectReadingPreferences,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { getReadingModeQueryParamValue } from '@/utils/readingPreference';
import { normalizeQueryParam } from '@/utils/url';
import { getVerseNumberFromKey } from '@/utils/verse';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import QueryParam from 'types/QueryParam';
import { ReadingPreference } from 'types/QuranReader';

// Threshold in pixels to consider the user "at the top" of the page
const SCROLL_TOP_THRESHOLD = 100;

const getQueryParamValueFromAsPath = (
  asPath: string,
  queryParam: QueryParam,
): string | undefined => {
  const queryString = asPath.split('?')[1]?.split('#')[0];
  if (!queryString) return undefined;

  const value = new URLSearchParams(queryString).get(queryParam);
  return value ?? undefined;
};

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
  const { readingPreference: reduxReadingPreference } = useSelector(selectReadingPreferences);
  const {
    value: resolvedReadingPreference,
  }: {
    value: ReadingPreference;
    isQueryParamDifferent: boolean;
  } = useGetQueryParamOrReduxValue(QueryParam.READING_MODE);
  const lastReadVerseKeyState = useSelector(selectLastReadVerseKey);

  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  const lastReadVerseKey = lastReadVerseKeyState.verseKey;
  const lastReadVerse = lastReadVerseKey
    ? getVerseNumberFromKey(lastReadVerseKey).toString()
    : undefined;

  const getUpdatedQueryParams = useCallback(
    (newPreference: ReadingPreference) => {
      const previousQueryParams = { ...router.query };
      const currentReadingModeFromAsPath = getQueryParamValueFromAsPath(
        router.asPath,
        QueryParam.READING_MODE,
      );
      if (currentReadingModeFromAsPath !== undefined) {
        previousQueryParams[QueryParam.READING_MODE] = currentReadingModeFromAsPath;
      } else {
        delete previousQueryParams[QueryParam.READING_MODE];
      }
      const newQueryParams = { ...previousQueryParams };
      const isAtTop = typeof window !== 'undefined' && window.scrollY <= SCROLL_TOP_THRESHOLD;

      if (context === SwitcherContext.SurahHeader || isAtTop) {
        delete newQueryParams.startingVerse;
      } else {
        const chapterId = normalizeQueryParam(router.query.chapterId);
        const isChapterScopedRoute = !!chapterId && !String(chapterId).includes(':');

        // For ContextMenu and MobileTabs when not at top, set startingVerse to ensure
        // the virtualized scroll hooks navigate to the correct verse/page.
        // Default to verse 1/1:1 if no verse has been tracked yet.
        newQueryParams.startingVerse = isChapterScopedRoute
          ? lastReadVerse || '1'
          : lastReadVerseKey || '1:1';
      }

      newQueryParams[QueryParam.READING_MODE] = getReadingModeQueryParamValue(newPreference);

      return {
        previousQueryParams,
        newQueryParams,
      };
    },
    [context, lastReadVerse, lastReadVerseKey, router.asPath, router.query],
  );

  const switchReadingPreference = useCallback(
    (newPreference: ReadingPreference) => {
      if (newPreference === resolvedReadingPreference) return;

      const { previousQueryParams, newQueryParams } = getUpdatedQueryParams(newPreference);

      // Mark that the user initiated this switch so the QueryParamMessage
      // banner is suppressed while this mode switch is in-flight.
      markUserSwitchedReadingMode(router.asPath);

      const newUrlObject = {
        pathname: router.pathname,
        query: newQueryParams,
      };
      const previousUrlObject = {
        pathname: router.pathname,
        query: previousQueryParams,
      };

      // Update Redux state first (synchronous dispatch + async API sync),
      // then update the URL. This ensures Redux and URL agree when the
      // component tree re-renders, avoiding a brief mismatch window that
      // would flash the QueryParamMessage banner and risk stale closures
      // during the heavy TranslationView ↔ ReadingView transition.
      onSettingsChange(
        'readingPreference',
        newPreference,
        setReadingPreference(newPreference),
        setReadingPreference(reduxReadingPreference),
        PreferenceGroup.READING,
        undefined,
        () => {
          router.replace(previousUrlObject, null, { shallow: true, scroll: false });
        },
      );

      // Update URL with shallow routing (no page reload).
      // The useScrollToVirtualizedVerse hooks in ReadingView/TranslationView
      // handle scrolling to the correct position based on startingVerse.
      router
        .replace(newUrlObject, null, { shallow: true, scroll: false })
        .finally(resetUserSwitchFlag);
    },
    [
      getUpdatedQueryParams,
      onSettingsChange,
      reduxReadingPreference,
      resolvedReadingPreference,
      router,
    ],
  );

  return {
    readingPreference: resolvedReadingPreference,
    switchReadingPreference,
    isLoading,
  };
};

export default useReadingPreferenceSwitcher;
