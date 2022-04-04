import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createMigrate,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { getStoreInitialState } from './defaultSettings/util';
import DefaultSettingsMiddleware from './middleware/defaultSettingsMiddleware';
import migrations from './migrations';
import {
  audioPlayerPersistConfig,
  audioPlayerState,
  commandBarPersistConfig,
  commandBar,
  defaultSettings,
  navbar,
  bookmarks,
  contextMenu,
  fontFaces,
  highlightedLocation,
  notes,
  readingPreferences,
  readingTracker,
  readingViewVerse,
  sidebarNavigation,
  quranReaderStyles,
  tafsirs,
  translations,
  radio,
  search,
  theme,
  voiceSearch,
  welcomeMessage,
} from './slices';

const persistConfig = {
  key: 'root',
  version: 17,
  storage,
  migrate: createMigrate(migrations, {
    debug: process.env.NEXT_PUBLIC_VERCEL_ENV === 'development',
  }),
  whitelist: [
    'quranReaderStyles',
    'readingPreferences',
    'translations',
    'theme',
    'tafsirs',
    'bookmarks',
    'search',
    'readingTracker',
    'welcomeMessage',
    'defaultSettings',
    'sidebarNavigation',
    'radio',
  ], // Reducers defined here will be have their values saved in local storage and persist across sessions. See: https://github.com/rt2zz/redux-persist#blacklist--whitelist
};

export const rootReducer = combineReducers({
  audioPlayerState: persistReducer(audioPlayerPersistConfig, audioPlayerState),
  contextMenu,
  navbar,
  notes,
  quranReaderStyles,
  readingPreferences,
  translations,
  theme,
  tafsirs,
  bookmarks,
  search,
  highlightedLocation,
  readingTracker,
  commandBar: persistReducer(commandBarPersistConfig, commandBar),
  welcomeMessage,
  voiceSearch,
  defaultSettings,
  fontFaces,
  sidebarNavigation,
  radio,
  readingViewVerse,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const getStore = (locale: string) =>
  configureStore({
    reducer: persistedReducer,
    // @ts-ignore
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Used for Redux-persist, see:https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(DefaultSettingsMiddleware),
    devTools: process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production', // disables the devtools in production
    // @ts-ignore
    preloadedState: getStoreInitialState(locale),
  });

export default getStore;
