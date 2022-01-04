import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

const DEFAULT_TRANSLATION = 45; // Elmir Kuliev
const DEFAULT_TAFSIR = 'ru-tafseer-al-saddi'; // Russian Tafseer Al Saddi

export default {
  ...DEFAULT_SETTINGS,
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
  tafsirs: { ...DEFAULT_SETTINGS.tafsirs, selectedTafsirs: [DEFAULT_TAFSIR] },
} as DefaultSettings;
