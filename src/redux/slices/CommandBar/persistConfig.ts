import storage from 'redux-persist/lib/storage';

const commandBarPersistConfig = {
  key: 'commandBar',
  storage,
  version: 1,
  blacklist: ['isOpen'],
};

export default commandBarPersistConfig;
