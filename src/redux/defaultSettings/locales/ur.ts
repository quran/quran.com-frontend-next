import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import { QuranFont } from 'types/QuranReader';

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
} as DefaultSettings;
