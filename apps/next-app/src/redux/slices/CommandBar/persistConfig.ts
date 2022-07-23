import storage from 'redux-persist/lib/storage';

import SliceName from 'src/redux/types/SliceName';

const commandBarPersistConfig = {
  key: SliceName.COMMAND_BAR,
  storage,
  version: 1,
  blacklist: ['isOpen'],
};

export default commandBarPersistConfig;
