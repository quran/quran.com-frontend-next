/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect, vi } from 'vitest';

import syncLocaleDependentSettings from '@/redux/actions/sync-locale-dependent-settings';
import {
  setLessonLanguages,
  setReflectionLanguages,
} from '@/redux/slices/QuranReader/readingPreferences';
import { setSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { setSelectedTranslations } from '@/redux/slices/QuranReader/translations';

vi.mock('@/redux/defaultSettings/util', () => ({
  getTranslationsInitialState: (locale: string) => ({
    selectedTranslations: locale === 'en' ? [131] : [],
  }),
  getTafsirsInitialState: (locale: string) => ({
    selectedTafsirs: locale === 'en' ? ['en-tafsir'] : ['ar-tafsir'],
  }),
  getReadingPreferencesInitialState: (locale: string) => ({
    selectedReflectionLanguages: [locale],
    selectedLessonLanguages: [locale],
  }),
}));

const runThunk = (state: any, prevLocale: string, nextLocale: string) => {
  const actions: any[] = [];
  const dispatch = (action: any) => {
    actions.push(action);
    return action;
  };
  const getState = () => state;
  syncLocaleDependentSettings({ prevLocale, nextLocale })(dispatch as any, getState as any);
  return actions;
};

describe('syncLocaleDependentSettings', () => {
  it('syncs locale-dependent defaults for translations, tafsir, lessons, and reflections', () => {
    const state = {
      translations: { isUsingDefaultTranslations: true },
      tafsirs: { isUsingDefaultTafsirs: true },
      readingPreferences: {
        selectedReflectionLanguages: ['ar'],
        selectedLessonLanguages: ['ar'],
      },
    };

    const actions = runThunk(state, 'ar', 'en');

    expect(actions).toEqual([
      {
        ...setSelectedTranslations({ translations: [131], locale: 'en' }),
        meta: { skipDefaultSettings: true },
      },
      {
        ...setSelectedTafsirs({ tafsirs: ['en-tafsir'], locale: 'en' }),
        meta: { skipDefaultSettings: true },
      },
      setReflectionLanguages(['en']),
      setLessonLanguages(['en']),
    ]);
  });

  it('does not overwrite single-language lessons/reflections when they do not match the previous locale', () => {
    const state = {
      translations: { isUsingDefaultTranslations: false },
      tafsirs: { isUsingDefaultTafsirs: false },
      readingPreferences: {
        // user explicitly picked Arabic content while site locale was English
        selectedReflectionLanguages: ['ar'],
        selectedLessonLanguages: ['ar'],
      },
    };

    const actions = runThunk(state, 'en', 'ar');

    // No changes expected: the single selection doesn't equal prevLocale ('en'), so treat as customized.
    expect(actions).toEqual([]);
  });

  it('adds the new locale to multi-language selections when missing', () => {
    const state = {
      translations: { isUsingDefaultTranslations: false },
      tafsirs: { isUsingDefaultTafsirs: false },
      readingPreferences: {
        selectedReflectionLanguages: ['ar', 'fr'],
        selectedLessonLanguages: ['ar', 'fr'],
      },
    };

    const actions = runThunk(state, 'ar', 'en');

    expect(actions).toEqual([
      setReflectionLanguages(['ar', 'fr', 'en']),
      setLessonLanguages(['ar', 'fr', 'en']),
    ]);
  });

  it('does not dispatch changes when multi-language selections already include the new locale', () => {
    const state = {
      translations: { isUsingDefaultTranslations: false },
      tafsirs: { isUsingDefaultTafsirs: false },
      readingPreferences: {
        selectedReflectionLanguages: ['ar', 'en'],
        selectedLessonLanguages: ['ar', 'en'],
      },
    };

    const actions = runThunk(state, 'ar', 'en');
    expect(actions).toEqual([]);
  });

  it('does not sync translations/tafsir when they are not using defaults', () => {
    const state = {
      translations: { isUsingDefaultTranslations: false },
      tafsirs: { isUsingDefaultTafsirs: false },
      readingPreferences: {
        selectedReflectionLanguages: ['ar'],
        selectedLessonLanguages: ['ar'],
      },
    };

    const actions = runThunk(state, 'ar', 'en');
    expect(actions).toEqual([setReflectionLanguages(['en']), setLessonLanguages(['en'])]);
  });
});
