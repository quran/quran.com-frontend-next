import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { configureStore, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit';
import quranReaderStyles from './slices/QuranReader/styles';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['quranReaderStyles'], // Reducers defined here will be have their values saved in local storage and persist across sessions. See: https://github.com/rt2zz/redux-persist#blacklist--whitelist
};

const rootReducer = combineReducers({
  quranReaderStyles,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      // Used for Redux-persist, see:https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
  devTools: process.env.NODE_ENV === 'development', // disables the devtools in production
});

export const persistor = persistStore(store);

export default store;
