import storage from 'redux-persist/lib/storage';

import SliceName from '@/redux/types/SliceName';

const studyModePersistConfig = {
  key: SliceName.STUDY_MODE,
  storage,
  version: 1,
  whitelist: ['isLessonsChapterBannerVisible', 'isReflectionsChapterBannerVisible'],
};

export default studyModePersistConfig;
