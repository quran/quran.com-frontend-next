import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import { QuranFont } from 'types/QuranReader';

const DEFAULT_TRANSLATION = 158; // Bayan Ul Quran
const DEFAULT_TAFSIR = 'tafseer-ibn-e-kaseer-urdu'; // Bayan ul Quran

export default {
  ...DEFAULT_SETTINGS,
  quranReaderStyles: {
    ...DEFAULT_SETTINGS.quranReaderStyles,
    quranFont: QuranFont.IndoPak,
  },
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    selectedWordByWordLocale: 'ur',
  },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
  tafsirs: { ...DEFAULT_SETTINGS.tafsirs, selectedTafsirs: [DEFAULT_TAFSIR] },
} as DefaultSettings;
