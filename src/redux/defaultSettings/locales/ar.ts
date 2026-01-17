import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import { ReadingPreference } from '@/types/QuranReader';

const DEFAULT_TAFSIR = 'ar-tafseer-al-qurtubi';
const DEFAULT_TRANSLATION = 1113;

export default {
  ...DEFAULT_SETTINGS,
  tafsirs: { ...DEFAULT_SETTINGS.tafsirs, selectedTafsirs: [DEFAULT_TAFSIR] },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    readingPreference: ReadingPreference.Reading,
  },
} as DefaultSettings;
