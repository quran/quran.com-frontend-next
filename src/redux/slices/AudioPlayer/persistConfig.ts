import sessionStorage from 'redux-persist/lib/storage/session';

import SliceName from 'src/redux/types/SliceName';

const audioPlayerPersistConfig = {
  key: SliceName.AUDIO_PLAYER_STATE,
  storage: sessionStorage,
  version: 3,
  blacklist: ['isPlaying', 'isDownloadingAudio', 'isRadioMode'],
};

export default audioPlayerPersistConfig;
