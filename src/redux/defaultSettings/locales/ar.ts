import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import Language from '@/types/Language';
import { ReadingPreference } from '@/types/QuranReader';

const DEFAULT_TAFSIR = 'ar-tafseer-al-qurtubi';

export default {
  ...DEFAULT_SETTINGS,
  tafsirs: { ...DEFAULT_SETTINGS.tafsirs, selectedTafsirs: [DEFAULT_TAFSIR] },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [] },
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    readingPreference: ReadingPreference.Reading,
    selectedReflectionLanguages: [Language.AR],
    selectedLessonLanguages: [Language.AR],
  },
} as DefaultSettings;
