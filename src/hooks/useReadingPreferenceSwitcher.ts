import { useCallback } from 'react';

import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import { getUpdatedQueryParams, SwitcherContext } from './useReadingPreferenceSwitcher.utils';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { markUserSwitchedReadingMode, resetUserSwitchFlag } from '@/hooks/readingModeSwitchTracker';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import {
  selectReadingPreferences,
  setReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getVerseNumberFromKey } from '@/utils/verse';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import QueryParam from 'types/QueryParam';
import { ReadingPreference } from 'types/QuranReader';

export { SwitcherContext } from './useReadingPreferenceSwitcher.utils';

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
  const selectedTranslations = useSelector(selectSelectedTranslations);

  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  const lastReadVerseKey = lastReadVerseKeyState.verseKey;
  const lastReadVerse = lastReadVerseKey
    ? getVerseNumberFromKey(lastReadVerseKey).toString()
    : undefined;

  const getNextReaderQueryParams = useCallback(
    (newPreference: ReadingPreference) => {
      return getUpdatedQueryParams({
        newPreference,
        query: router.query,
        asPath: router.asPath,
        context,
        lastReadVerse,
        lastReadVerseKey: lastReadVerseKey || undefined,
        selectedTranslations,
        scrollY: typeof window !== 'undefined' ? window.scrollY : undefined,
      });
    },
    [context, lastReadVerse, lastReadVerseKey, router.asPath, router.query, selectedTranslations],
  );

  const replaceReaderQuery = useCallback(
    (query: typeof router.query) =>
      router.replace(
        {
          pathname: router.pathname,
          query,
        },
        null,
        { shallow: true, scroll: false },
      ),
    [router],
  );

  const switchReadingPreference = useCallback(
    (newPreference: ReadingPreference) => {
      if (newPreference === resolvedReadingPreference) return;

      const { previousQueryParams, newQueryParams } = getNextReaderQueryParams(newPreference);

      // Mark that the user initiated this switch so the QueryParamMessage
      // banner is suppressed while this mode switch is in-flight.
      markUserSwitchedReadingMode(router.asPath);

      const forwardNavigationPromise = replaceReaderQuery(newQueryParams);

      onSettingsChange(
        'readingPreference',
        newPreference,
        setReadingPreference(newPreference),
        setReadingPreference(reduxReadingPreference),
        PreferenceGroup.READING,
        () => {
          forwardNavigationPromise.finally(resetUserSwitchFlag);
        },
        () => {
          markUserSwitchedReadingMode(router.asPath);
          replaceReaderQuery(previousQueryParams).finally(resetUserSwitchFlag);
        },
      );
    },
    [
      getNextReaderQueryParams,
      onSettingsChange,
      replaceReaderQuery,
      reduxReadingPreference,
      resolvedReadingPreference,
      router.asPath,
    ],
  );

  return {
    readingPreference: resolvedReadingPreference,
    switchReadingPreference,
    isLoading,
  };
};

export default useReadingPreferenceSwitcher;
