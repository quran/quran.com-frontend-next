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
import banner from './slices/banner';
import commandBarPersistConfig from './slices/CommandBar/persistConfig';
import commandBar from './slices/CommandBar/state';
import defaultSettings from './slices/defaultSettings';
import mediaMaker from './slices/mediaMaker';
import navbar from './slices/navbar';
import notifications from './slices/notifications';
import onboarding from './slices/onboarding';
import persistGateHydration from './slices/persistGateHydration';
import bookmarks from './slices/QuranReader/bookmarks';
import contextMenu from './slices/QuranReader/contextMenu';
import fontFaces from './slices/QuranReader/font-faces';
import notes from './slices/QuranReader/notes';
import readingPreferences from './slices/QuranReader/readingPreferences';
import readingTracker from './slices/QuranReader/readingTracker';
import readingViewVerse from './slices/QuranReader/readingViewVerse';
import sidebarNavigation from './slices/QuranReader/sidebarNavigation';
import quranReaderStyles from './slices/QuranReader/styles';
import tafsirs from './slices/QuranReader/tafsirs';
import translations from './slices/QuranReader/translations';
import revelationOrder from './slices/revelationOrder';
import search from './slices/Search/search';
import session from './slices/session';
import theme from './slices/theme';
import voiceSearch from './slices/voiceSearch';
import welcomeMessage from './slices/welcomeMessage';
import SliceName from './types/SliceName';

const persistConfig = {
  key: 'root',
  version: 32,
  storage,
  migrate: createMigrate(migrations, {
    debug: process.env.NEXT_PUBLIC_VERCEL_ENV === 'development',
  }),
  whitelist: [
    SliceName.QURAN_READER_STYLES,
    SliceName.READING_PREFERENCES,
    SliceName.TRANSLATIONS,
    SliceName.THEME,
    SliceName.TAFSIRS,
    SliceName.SEARCH,
    SliceName.READING_TRACKER,
    SliceName.WELCOME_MESSAGE,
    SliceName.DEFAULT_SETTINGS,
    SliceName.SIDEBAR_NAVIGATION,
    SliceName.BANNER,
    SliceName.SESSION,
    SliceName.BOOKMARKS,
    SliceName.USER_DATA_SYNC,
    SliceName.REVELATION_ORDER,
    SliceName.ONBOARDING,
    SliceName.MEDIA_MAKER,
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
  readingTracker,
  commandBar: persistReducer(commandBarPersistConfig, commandBar),
  welcomeMessage,
  voiceSearch,
  defaultSettings,
  fontFaces,
  sidebarNavigation,
  readingViewVerse,
  banner,
  session,
  persistGateHydration,
  revelationOrder,
  notifications,
  onboarding,
  mediaMaker,
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
