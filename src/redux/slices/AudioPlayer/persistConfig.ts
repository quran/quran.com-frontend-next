import storage from 'redux-persist/lib/storage';

const audioPlayerPersistConfig = {
  key: 'audioPlayerState',
  storage,
  version: 1,
  blacklist: ['isPlaying'],
};

export default audioPlayerPersistConfig;
