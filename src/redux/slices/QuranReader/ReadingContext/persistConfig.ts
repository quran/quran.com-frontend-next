import storage from 'redux-persist/lib/storage';

const readingContextPersistConfig = {
  key: 'readingContextState',
  storage,
  version: 1,
  blacklist: ['visibleVerseKeys'],
};

export default readingContextPersistConfig;
