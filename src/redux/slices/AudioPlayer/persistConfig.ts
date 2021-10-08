import storage from 'redux-persist/lib/storage';

const audioPlayerPersistConfig = {
  key: 'audioPlayerState',
  storage,
  version: 3,
  blacklist: ['isPlaying', 'isMobileMinimizedForScrolling', 'isDownloadingAudio'],
};

export default audioPlayerPersistConfig;
