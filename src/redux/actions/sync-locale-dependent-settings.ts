/* eslint-disable react-func/max-lines-per-function */
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

type Params = {
  prevLocale: string;
  nextLocale: string;
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

    // Translations: if user is using defaults, switch to the new locale's defaults.
    if (state.translations?.isUsingDefaultTranslations) {
      const defaultTranslations = getTranslationsInitialState(nextLocale).selectedTranslations;
      dispatch({
        ...setSelectedTranslations({ translations: defaultTranslations, locale: nextLocale }),
        meta: { skipDefaultSettings: true },
      });
    }

    // Tafsir: if user is using defaults, switch to the new locale's defaults.
    if (state.tafsirs?.isUsingDefaultTafsirs) {
      const defaultTafsirs = getTafsirsInitialState(nextLocale).selectedTafsirs;
      dispatch({
        ...setSelectedTafsirs({ tafsirs: defaultTafsirs, locale: nextLocale }),
        meta: { skipDefaultSettings: true },
      });
    }

    // Reflections/Lessons language selector semantics:
    // - Single language matching the current locale => treat as "follow locale" and replace.
    // - Multiple languages => preserve, but add the new locale if missing.
    const { selectedReflectionLanguages, selectedLessonLanguages } = state.readingPreferences;
    const defaultReadingPrefs = getReadingPreferencesInitialState(nextLocale);

    if (Array.isArray(selectedReflectionLanguages)) {
      if (
        selectedReflectionLanguages.length === 1 &&
        selectedReflectionLanguages[0] === prevLocale
      ) {
        dispatch(setReflectionLanguages(defaultReadingPrefs.selectedReflectionLanguages));
      } else if (
        selectedReflectionLanguages.length > 1 &&
        !selectedReflectionLanguages.includes(nextLocale)
      ) {
        dispatch(setReflectionLanguages([...selectedReflectionLanguages, nextLocale]));
      }
    }

    if (Array.isArray(selectedLessonLanguages)) {
      if (selectedLessonLanguages.length === 1 && selectedLessonLanguages[0] === prevLocale) {
        dispatch(setLessonLanguages(defaultReadingPrefs.selectedLessonLanguages));
      } else if (
        selectedLessonLanguages.length > 1 &&
        !selectedLessonLanguages.includes(nextLocale)
      ) {
        dispatch(setLessonLanguages([...selectedLessonLanguages, nextLocale]));
      }
    }
  };

export default syncLocaleDependentSettings;
