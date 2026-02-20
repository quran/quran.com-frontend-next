import { configureStore } from '@reduxjs/toolkit';
import mergeWith from 'lodash/mergeWith';

import type { DeepPartial } from './types';

import DefaultSettingsMiddleware from '@/redux/middleware/defaultSettingsMiddleware';
import type { RootState } from '@/redux/RootState';
import { rootReducer } from '@/redux/store';

/**
 * Full initial state for every Redux slice, computed once at module load.
 *
 * This seeds ALL 20+ slice defaults (not just the 8 locale-dependent ones
 * previously returned by getStoreInitialState()). vi.mock hoisting ensures
 * any mocked dependencies are already in effect when this runs.
 */
const rootInitialState: RootState = configureStore({ reducer: rootReducer }).getState();

/**
 * Merge a DeepPartial preloadedState over the full slice defaults so that
 * partial nested overrides work correctly.
 *
 * Problem: Redux's combineReducers only falls back to a slice's initialState
 * when the slice's portion of preloadedState is `undefined`. If a test passes
 * { quranReaderStyles: { quranFont: QuranFont.Tajweed } }, the reducer
 * receives that partial object as its state — so all other fields (14 of them)
 * come out undefined, causing component crashes or false test results.
 *
 * Fix: pre-merge against rootInitialState (all slices' defaults). Overrides
 * layer on top, so only the specified fields change.
 *
 * Arrays are replaced wholesale (not merged by index) so that overriding
 * selectedTranslations: [20] replaces the default list, not index-merges it.
 */
const buildPreloadedState = (overrides: DeepPartial<RootState>): Partial<RootState> =>
  mergeWith({}, rootInitialState, overrides, (obj: unknown, src: unknown) =>
    Array.isArray(src) ? src : undefined,
  ) as Partial<RootState>;

export const makeStore = (preloadedState: DeepPartial<RootState> = {}) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(DefaultSettingsMiddleware),
    preloadedState: buildPreloadedState(preloadedState),
  });

export type TestStore = ReturnType<typeof makeStore>;
export type TestAppDispatch = TestStore['dispatch'];
