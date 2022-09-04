import storage from 'redux-persist/lib/storage';

import SliceName from '@/redux/types/SliceName';

const audioPlayerPersistConfig = {
  key: SliceName.AUDIO_PLAYER_STATE,
  storage,
  version: 3,
  blacklist: ['isDownloadingAudio'],
};

export default audioPlayerPersistConfig;
