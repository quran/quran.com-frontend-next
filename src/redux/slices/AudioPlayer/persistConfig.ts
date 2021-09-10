import storage from 'redux-persist/lib/storage';

const audioPlayerPersistConfig = {
  key: 'audioPlayerState',
  storage,
  version: 2,
  blacklist: ['isPlaying', 'visibility', 'isMinimized'],
};

export default audioPlayerPersistConfig;
