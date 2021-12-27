import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import { ReadingPreference } from 'types/QuranReader';

const DEFAULT_TAFSIR = 90; // AlQurtubi

export default {
  ...DEFAULT_SETTINGS,
  tafsirs: { ...DEFAULT_SETTINGS.tafsirs, selectedTafsirs: [DEFAULT_TAFSIR] },
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    readingPreference: ReadingPreference.Reading,
  },
} as DefaultSettings;
