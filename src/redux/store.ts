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
import audioPlayerPersistConfig from './slices/AudioPlayer/persistConfig';
import audioPlayerState from './slices/AudioPlayer/state';
import commandBarPersistConfig from './slices/CommandBar/persistConfig';
import commandBar from './slices/CommandBar/state';
import defaultSettings from './slices/defaultSettings';
import navbar from './slices/navbar';
import prayerTimes from './slices/prayerTimes';
import bookmarks from './slices/QuranReader/bookmarks';
import contextMenu from './slices/QuranReader/contextMenu';
import highlightedLocation from './slices/QuranReader/highlightedLocation';
import notes from './slices/QuranReader/notes';
import readingPreferences from './slices/QuranReader/readingPreferences';
import readingTracker from './slices/QuranReader/readingTracker';
import quranReaderStyles from './slices/QuranReader/styles';
import tafsirs from './slices/QuranReader/tafsirs';
import translations from './slices/QuranReader/translations';
import search from './slices/Search/search';
import theme from './slices/theme';
import voiceSearch from './slices/voiceSearch';
import welcomeMessage from './slices/welcomeMessage';

const persistConfig = {
  key: 'root',
  version: 15,
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
    'prayerTimes',
    'defaultSettings',
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
  prayerTimes,
  defaultSettings,
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
