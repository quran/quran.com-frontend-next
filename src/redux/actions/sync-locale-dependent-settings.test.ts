/* eslint-disable react-func/max-lines-per-function */
import { AnyAction } from '@reduxjs/toolkit';
import type { Dispatch } from 'redux';
import { describe, it, expect, vi } from 'vitest';

import syncLocaleDependentSettings from '@/redux/actions/sync-locale-dependent-settings';
import type { RootState } from '@/redux/RootState';
import {
  setLessonLanguages,
  setReflectionLanguages,
} from '@/redux/slices/QuranReader/readingPreferences';
import { setSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { setSelectedTranslations } from '@/redux/slices/QuranReader/translations';

type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

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

const runThunk = (state: DeepPartial<RootState>, prevLocale: string, nextLocale: string) => {
  const actions: AnyAction[] = [];
  const dispatch: Dispatch<AnyAction> = (action: AnyAction) => {
    actions.push(action);
    return action;
  };
  const getState = () => state as RootState;
  syncLocaleDependentSettings({ prevLocale, nextLocale })(dispatch, getState);
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
      {
        ...setReflectionLanguages(['en']),
        meta: { skipCustomization: true, skipDefaultSettings: true },
      },
      {
        ...setLessonLanguages(['en']),
        meta: { skipCustomization: true, skipDefaultSettings: true },
      },
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

  it('does not mutate multi-language selections when switching locale', () => {
    const state = {
      translations: { isUsingDefaultTranslations: false },
      tafsirs: { isUsingDefaultTafsirs: false },
      readingPreferences: {
        selectedReflectionLanguages: ['ar', 'fr'],
        selectedLessonLanguages: ['ar', 'fr'],
      },
    };

    const actions = runThunk(state, 'ar', 'en');

    expect(actions).toEqual([]);
  });

  it('treats as customized when user previously changed it (even if back to defaults)', () => {
    const state = {
      translations: { isUsingDefaultTranslations: false },
      tafsirs: { isUsingDefaultTafsirs: false },
      readingPreferences: {
        // matches prev-locale defaults per the mock implementation
        selectedReflectionLanguages: ['ar'],
        selectedLessonLanguages: ['ar'],
        hasCustomizedReflectionLanguages: true,
        hasCustomizedLessonLanguages: true,
      },
    };

    const actions = runThunk(state, 'ar', 'en');
    expect(actions).toEqual([]);
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
    expect(actions).toEqual([
      {
        ...setReflectionLanguages(['en']),
        meta: { skipCustomization: true, skipDefaultSettings: true },
      },
      {
        ...setLessonLanguages(['en']),
        meta: { skipCustomization: true, skipDefaultSettings: true },
      },
    ]);
  });
});
