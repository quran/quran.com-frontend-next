import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import Language from '@/types/Language';

const DEFAULT_TRANSLATION = 39; // Abdullah Muhammad Basmeih

export default {
  ...DEFAULT_SETTINGS,
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    selectedReflectionLanguages: [Language.MS],
    selectedLessonLanguages: [Language.MS],
  },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
} as DefaultSettings;
