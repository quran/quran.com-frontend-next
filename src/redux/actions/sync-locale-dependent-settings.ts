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

const arraysEqual = (a?: string[], b?: string[]) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

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
    // - Treat as customized if the user ever manually changed it (sticky flags).
    // - For safe migration, also treat as customized if the stored value differs from
    //   the previous locale defaults.
    const {
      selectedReflectionLanguages,
      selectedLessonLanguages,
      hasCustomizedReflectionLanguages,
      hasCustomizedLessonLanguages,
    } = state.readingPreferences;
    const defaultReadingPrefsPrev = getReadingPreferencesInitialState(prevLocale);
    const defaultReadingPrefsNext = getReadingPreferencesInitialState(nextLocale);

    const isReflectionCustomized =
      hasCustomizedReflectionLanguages === true ||
      !arraysEqual(
        selectedReflectionLanguages,
        defaultReadingPrefsPrev.selectedReflectionLanguages,
      );
    const isLessonCustomized =
      hasCustomizedLessonLanguages === true ||
      !arraysEqual(selectedLessonLanguages, defaultReadingPrefsPrev.selectedLessonLanguages);

    if (!isReflectionCustomized) {
      dispatch({
        ...setReflectionLanguages(defaultReadingPrefsNext.selectedReflectionLanguages),
        meta: { skipCustomization: true, skipDefaultSettings: true },
      });
    }

    if (!isLessonCustomized) {
      dispatch({
        ...setLessonLanguages(defaultReadingPrefsNext.selectedLessonLanguages),
        meta: { skipCustomization: true, skipDefaultSettings: true },
      });
    }
  };

export default syncLocaleDependentSettings;
