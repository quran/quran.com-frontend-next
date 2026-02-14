import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import Language from '@/types/Language';
import { QuranFont } from '@/types/QuranReader';

const DEFAULT_TRANSLATION = 33; // Indonesian Islamic affairs ministry

export default {
  ...DEFAULT_SETTINGS,
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    selectedWordByWordLocale: 'id',
    selectedReflectionLanguages: [Language.ID],
    selectedLessonLanguages: [Language.ID],
  },
  quranReaderStyles: {
    ...DEFAULT_SETTINGS.quranReaderStyles,
    quranFont: QuranFont.IndoPak,
  },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
} as DefaultSettings;
