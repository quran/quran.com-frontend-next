import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

const DEFAULT_TRANSLATION = 83; // Sheikh Isa Garcia

export default {
  ...DEFAULT_SETTINGS,
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
} as DefaultSettings;
