import type { Page } from '@playwright/test';

export const PREFERENCES_API_PATTERN = `**/auth/preferences*`;

// Type definitions for preference configuration
interface QuranReaderStyles {
  quranFont: string;
  wordByWordFontScale: number;
  translationFontScale: number;
}

interface UserHasCustomised {
  userHasCustomised: boolean;
}

interface Language {
  language: string;
}

interface Theme {
  type: string;
}

interface Reading {
  readingPreference: string;
  wordByWordDisplay: string[];
  wordByWordContentType: string[];
  wordClickFunctionality: string;
}

interface Translations {
  selectedTranslations: number[];
}

interface Audio {
  reciter: number;
}

interface PreferencesConfig {
  quranReaderStyles: Partial<QuranReaderStyles>;
  userHasCustomised: Partial<UserHasCustomised>;
  language: Partial<Language>;
  theme: Partial<Theme>;
  reading: Partial<Reading>;
  translations: Partial<Translations>;
  audio: Partial<Audio>;
}

// Default preferences data
export const DEFAULT_PREFERENCES: PreferencesConfig = {
  quranReaderStyles: {
    quranFont: 'tajweed_v4',
    wordByWordFontScale: 3,
    translationFontScale: 2,
  },
  userHasCustomised: {
    userHasCustomised: true,
  },
  language: {
    language: 'en',
  },
  theme: {
    type: 'light',
  },
  reading: {
    readingPreference: 'translation',
    wordByWordDisplay: ['tooltip'],
    wordByWordContentType: ['translation', 'transliteration'],
    wordClickFunctionality: 'play-audio',
  },
  translations: {
    selectedTranslations: [85, 131, 84, 95, 19],
  },
  audio: {
    reciter: 9,
  },
};

/**
 * Create a mock preferences API response with optional overrides
 * @param {Page} page - Playwright page instance
 * @param {Partial<PreferencesConfig>[]} configs - Configuration objects to merge with defaults (later configs override earlier ones)
 * @returns {Promise<void>}
 */
export const mockPreferencesApi = async (
  page: Page,
  ...configs: Partial<PreferencesConfig>[]
): Promise<void> => {
  const mergedConfig = Object.assign({}, DEFAULT_PREFERENCES, ...configs);

  return page.route(PREFERENCES_API_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mergedConfig),
    });
  });
};

/**
 * Create a translation configuration object with the given translation IDs
 * @param {number[]} translationIds - Array of translation IDs to include
 * @returns {Partial<PreferencesConfig>} Translation configuration object
 */
export const createTranslationConfig = (
  ...translationIds: number[]
): Partial<PreferencesConfig> => ({
  translations: {
    selectedTranslations: translationIds,
  },
});
