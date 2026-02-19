import { configureStore } from '@reduxjs/toolkit';

import type { DeepPartial } from './types';

import DefaultSettingsMiddleware from '@/redux/middleware/defaultSettingsMiddleware';
import type { RootState } from '@/redux/RootState';
import { rootReducer } from '@/redux/store';

export const makeStore = (preloadedState: DeepPartial<RootState> = {}) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(DefaultSettingsMiddleware),
    // Cast: our DeepPartial<RootState> is a strict subset of RTK's internal
    // PreloadedState type — the cast is safe because Redux merges any missing
    // fields with each slice's own initialState.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    preloadedState: preloadedState as any,
  });

export type TestStore = ReturnType<typeof makeStore>;
export type TestAppDispatch = TestStore['dispatch'];
