import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

export default {
  ...DEFAULT_SETTINGS,
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    selectedWordByWordLocale: 'id',
  },
} as DefaultSettings;
