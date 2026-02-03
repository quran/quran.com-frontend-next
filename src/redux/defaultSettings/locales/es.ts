import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import Language from '@/types/Language';

const DEFAULT_TRANSLATION = 83; // Sheikh Isa Garcia

export default {
  ...DEFAULT_SETTINGS,
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    selectedReflectionLanguages: [Language.ES],
    selectedLessonLanguages: [Language.ES],
  },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
} as DefaultSettings;
