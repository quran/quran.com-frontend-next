import sessionStorage from 'redux-persist/lib/storage/session';

const audioPlayerPersistConfig = {
  key: 'audioPlayerState',
  storage: sessionStorage,
  version: 3,
  blacklist: ['isPlaying', 'isMobileMinimizedForScrolling', 'isDownloadingAudio', 'isRadioMode'],
};

export default audioPlayerPersistConfig;
