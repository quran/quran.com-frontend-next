/* eslint-disable react-func/max-lines-per-function */
import { AnyAction } from '@reduxjs/toolkit';
import type { Dispatch } from 'redux';
import { describe, it, expect, vi } from 'vitest';

import syncLocaleDependentSettings from '@/redux/actions/sync-locale-dependent-settings';
import type { RootState } from '@/redux/RootState';
import { setSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { setSelectedTranslations } from '@/redux/slices/QuranReader/translations';

type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

vi.mock('@/redux/defaultSettings/util', () => ({
  getTranslationsInitialState: (locale?: string) => ({
    selectedTranslations: typeof locale === 'string' && locale.startsWith('en') ? [131] : [],
  }),
  getTafsirsInitialState: (locale?: string) => ({
    selectedTafsirs:
      typeof locale === 'string' && locale.startsWith('en') ? ['en-tafsir'] : ['ar-tafsir'],
  }),
  getReadingPreferencesInitialState: () => ({}),
}));

const runThunk = (state: DeepPartial<RootState>, nextLocale: string) => {
  const actions: AnyAction[] = [];
  const dispatch: Dispatch<AnyAction> = (action: AnyAction) => {
    actions.push(action);
    return action;
  };
  const getState = () => state as RootState;
  syncLocaleDependentSettings({ nextLocale })(dispatch, getState);
  return actions;
};

describe('syncLocaleDependentSettings', () => {
  it('syncs locale-dependent defaults for translations and tafsir', () => {
    const state = {
      translations: { isUsingDefaultTranslations: true },
      tafsirs: { isUsingDefaultTafsirs: true },
      readingPreferences: {},
    };

    const actions = runThunk(state, 'en');
    expect(actions).toEqual([
      {
        ...setSelectedTranslations({ translations: [131], locale: 'en' }),
        meta: { skipDefaultSettings: true },
      },
      {
        ...setSelectedTafsirs({ tafsirs: ['en-tafsir'], locale: 'en' }),
        meta: { skipDefaultSettings: true },
      },
    ]);
  });

  it('does not sync translations/tafsir when they are not using defaults', () => {
    const state = {
      translations: { isUsingDefaultTranslations: false },
      tafsirs: { isUsingDefaultTafsirs: false },
      readingPreferences: {},
    };

    const actions = runThunk(state, 'en');
    expect(actions).toEqual([]);
  });

  it('does not dispatch when next-locale defaults equal current values', () => {
    const state = {
      translations: { isUsingDefaultTranslations: true, selectedTranslations: [131] },
      tafsirs: { isUsingDefaultTafsirs: true, selectedTafsirs: ['en-tafsir'] },
      readingPreferences: {},
    };

    const actions = runThunk(state, 'en-GB');
    expect(actions).toEqual([]);
  });
});
