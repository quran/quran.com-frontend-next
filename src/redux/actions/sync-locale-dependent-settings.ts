import { AnyAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import {
  getReadingPreferencesInitialState,
  getTafsirsInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import { RootState } from '@/redux/RootState';
import {
  setLessonLanguages,
  setReflectionLanguages,
} from '@/redux/slices/QuranReader/readingPreferences';
import { setSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { setSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { areArraysEqual } from '@/utils/array';

type Params = {
  prevLocale: string;
  nextLocale: string;
};

const syncTranslationsIfUsingDefaults = (
  state: RootState,
  dispatch: Dispatch<AnyAction>,
  nextLocale: string,
) => {
  if (!state.translations?.isUsingDefaultTranslations) return;

  const defaultTranslations = getTranslationsInitialState(nextLocale).selectedTranslations;
  const currentTranslations = state.translations?.selectedTranslations || [];
  // Avoid redundant dispatches when next-locale defaults are already selected.
  if (areArraysEqual(currentTranslations, defaultTranslations)) return;

  dispatch({
    ...setSelectedTranslations({ translations: defaultTranslations, locale: nextLocale }),
    meta: { skipDefaultSettings: true },
  });
};

const syncTafsirsIfUsingDefaults = (
  state: RootState,
  dispatch: Dispatch<AnyAction>,
  nextLocale: string,
) => {
  if (!state.tafsirs?.isUsingDefaultTafsirs) return;

  const defaultTafsirs = getTafsirsInitialState(nextLocale).selectedTafsirs;
  const currentTafsirs = state.tafsirs?.selectedTafsirs || [];
  // Avoid redundant dispatches when next-locale defaults are already selected.
  if (areArraysEqual(currentTafsirs, defaultTafsirs)) return;

  dispatch({
    ...setSelectedTafsirs({ tafsirs: defaultTafsirs, locale: nextLocale }),
    meta: { skipDefaultSettings: true },
  });
};

const isReadingPreferenceLanguageCustomized = (
  selectedLanguages: string[],
  hasCustomizedLanguages: boolean | undefined,
  defaultLanguagesForPrevLocale: string[],
) =>
  hasCustomizedLanguages === true ||
  !areArraysEqual(selectedLanguages, defaultLanguagesForPrevLocale);

const syncReflectionLanguagesIfNotCustomized = (
  readingPreferences: RootState['readingPreferences'],
  dispatch: Dispatch<AnyAction>,
  defaultReadingPrefsPrev: ReturnType<typeof getReadingPreferencesInitialState>,
  defaultReadingPrefsNext: ReturnType<typeof getReadingPreferencesInitialState>,
) => {
  const { selectedReflectionLanguages, hasCustomizedReflectionLanguages } = readingPreferences;
  const isReflectionCustomized = isReadingPreferenceLanguageCustomized(
    selectedReflectionLanguages,
    hasCustomizedReflectionLanguages,
    defaultReadingPrefsPrev.selectedReflectionLanguages,
  );
  if (isReflectionCustomized) return;
  // Avoid redundant dispatches when the next-locale defaults are already selected.
  if (
    areArraysEqual(selectedReflectionLanguages, defaultReadingPrefsNext.selectedReflectionLanguages)
  ) {
    return;
  }

  dispatch({
    ...setReflectionLanguages(defaultReadingPrefsNext.selectedReflectionLanguages),
    meta: { skipCustomization: true, skipDefaultSettings: true },
  });
};

const syncLessonLanguagesIfNotCustomized = (
  readingPreferences: RootState['readingPreferences'],
  dispatch: Dispatch<AnyAction>,
  defaultReadingPrefsPrev: ReturnType<typeof getReadingPreferencesInitialState>,
  defaultReadingPrefsNext: ReturnType<typeof getReadingPreferencesInitialState>,
) => {
  const { selectedLessonLanguages, hasCustomizedLessonLanguages } = readingPreferences;
  const isLessonCustomized = isReadingPreferenceLanguageCustomized(
    selectedLessonLanguages,
    hasCustomizedLessonLanguages,
    defaultReadingPrefsPrev.selectedLessonLanguages,
  );
  if (isLessonCustomized) return;
  // Avoid redundant dispatches when the next-locale defaults are already selected.
  if (areArraysEqual(selectedLessonLanguages, defaultReadingPrefsNext.selectedLessonLanguages)) {
    return;
  }

  dispatch({
    ...setLessonLanguages(defaultReadingPrefsNext.selectedLessonLanguages),
    meta: { skipCustomization: true, skipDefaultSettings: true },
  });
};

const syncReflectionAndLessonLanguagesIfNotCustomized = (
  state: RootState,
  dispatch: Dispatch<AnyAction>,
  prevLocale: string,
  nextLocale: string,
) => {
  // Reflections/Lessons language selector semantics:
  // - Treat as customized if the user ever manually changed it (sticky flags).
  // - For safe migration, also treat as customized if the stored value differs from
  //   the previous locale defaults.
  const defaultReadingPrefsPrev = getReadingPreferencesInitialState(prevLocale);
  const defaultReadingPrefsNext = getReadingPreferencesInitialState(nextLocale);

  syncReflectionLanguagesIfNotCustomized(
    state.readingPreferences,
    dispatch,
    defaultReadingPrefsPrev,
    defaultReadingPrefsNext,
  );
  syncLessonLanguagesIfNotCustomized(
    state.readingPreferences,
    dispatch,
    defaultReadingPrefsPrev,
    defaultReadingPrefsNext,
  );
};

/**
 * Keep locale-dependent content preferences (e.g. default tafsir/translation and
 * reflections/lessons languages) aligned with the site locale when the user
 * hasn't customized those specific preferences.
 *
 * This is intentionally more granular than `resetSettings` so that customized
 * settings are preserved while "default-follow-locale" preferences still update.
 * @returns {void}
 */
const syncLocaleDependentSettings =
  ({ prevLocale, nextLocale }: Params) =>
  (dispatch: Dispatch<AnyAction>, getState: () => RootState) => {
    const state = getState();

    syncTranslationsIfUsingDefaults(state, dispatch, nextLocale);
    syncTafsirsIfUsingDefaults(state, dispatch, nextLocale);
    syncReflectionAndLessonLanguagesIfNotCustomized(state, dispatch, prevLocale, nextLocale);
  };

export default syncLocaleDependentSettings;
