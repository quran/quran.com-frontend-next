import { configureStore } from '@reduxjs/toolkit';

import DefaultSettingsMiddleware from '@/redux/middleware/defaultSettingsMiddleware';
import type { RootState } from '@/redux/RootState';
import { rootReducer } from '@/redux/store';

export const makeStore = (preloadedState: Partial<RootState> = {}) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(DefaultSettingsMiddleware),
    preloadedState,
  });

export type TestStore = ReturnType<typeof makeStore>;
export type TestAppDispatch = TestStore['dispatch'];
