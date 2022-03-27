import sessionStorage from 'redux-persist/lib/storage/session';

const audioPlayerPersistConfig = {
  key: 'audioPlayerState',
  storage: sessionStorage,
  version: 3,
  blacklist: ['isPlaying', 'isDownloadingAudio', 'isRadioMode'],
};

export default audioPlayerPersistConfig;
