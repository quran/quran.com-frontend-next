import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import { ReadingPreference } from 'types/QuranReader';

export default {
  ...DEFAULT_SETTINGS,
  tafsirs: { ...DEFAULT_SETTINGS.tafsirs, selectedTafsirs: [] },
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    readingPreference: ReadingPreference.Reading,
  },
} as DefaultSettings;
