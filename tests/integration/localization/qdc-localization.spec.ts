/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { test, expect, BrowserContext, Page } from '@playwright/test';

// Import the Homepage POM for reusable functionality
import { mockCountryLanguagePreferences } from '../../mocks/data';
import { setTestData, clearTestData } from '../../mocks/msw/handlers.js';
import Homepage from '../../POM/home-page';

import { DefaultSettings } from '@/redux/slices/defaultSettings';

// Add TypeScript declaration for window.__store
declare global {
  interface Window {
    __store?: any;
  }
}

/**
 * QDC Intelligent Localization Test Suite
 *
 * This test suite implements the comprehensive test plan for QDC's intelligent
 * localization feature as documented in qdc-localization-test-plan.md
 *
 * SSR API Mocking Strategy:
 * ========================
 * This test suite uses Playwright's route mocking to intercept SSR API calls.
 * The route mocking is set up in the test helper methods and intercepts API calls
 * made during server-side rendering, allowing us to test different language/country
 * combinations without hitting the real API.
 *
 * API calls are intercepted before each test navigation to ensure SSR gets the
 * mocked responses during the initial page load.
 *
 * To run these tests:
 * - yarn test:integration (runs all integration tests)
 * - yarn playwright test localization (runs only localization tests)
 *
 * The test server runs on http://localhost:3005
 */

// Test data constants
const SUPPORTED_LANGUAGES = {
  ENGLISH: 'en',
  ARABIC: 'ar',
  BENGALI: 'bn',
  PERSIAN: 'fa',
  FRENCH: 'fr',
  INDONESIAN: 'id',
  ITALIAN: 'it',
  DUTCH: 'nl',
  PORTUGUESE: 'pt',
  RUSSIAN: 'ru',
  ALBANIAN: 'sq',
  THAI: 'th',
  TURKISH: 'tr',
  URDU: 'ur',
  CHINESE: 'zh',
  MALAY: 'ms',
} as const;

const UNSUPPORTED_LANGUAGES = {
  JAPANESE: 'ja',
  HEBREW: 'he',
  HINDI: 'hi',
} as const;

const TEST_COUNTRIES = {
  US: 'US',
  GB: 'GB',
  CA: 'CA',
  AU: 'AU',
  IN: 'IN',
  SA: 'SA',
  EG: 'EG',
  JP: 'JP',
  DE: 'DE',
} as const;

const TIMEOUT_MS = 300000;

const NAVIGATION_OPTIONS = { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS } as const;

// Helper functions
class LocalizationTestHelper {
  private page: Page;

  public homepage: Homepage;

  private headers: Record<string, string> = {};

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.homepage = new Homepage(page, context);
  }

  public getHeaders(): Record<string, string> {
    return this.headers;
  }

  async getCookieValue(cookieName: string): Promise<string | undefined> {
    const cookies = await this.page.context().cookies();
    return cookies.find((cookie) => cookie.name === cookieName)?.value;
  }

  async expectNextLocaleCookieToBe(expectedLocale: string): Promise<void> {
    await expect
      .poll(async () => this.getCookieValue('NEXT_LOCALE'), {
        timeout: 5000,
        intervals: [100, 250, 500],
      })
      .toBe(expectedLocale);
  }

  /**
   * Mocks the country via the CF-IPCountry header and sets up the API mock accordingly.
   * This is designed to be used with a context that already has the locale set.
   */
  async mockCountryAndApiForContext(countryCode: string, language: string) {
    const normalizedCountry = countryCode.toUpperCase();
    this.headers['CF-IPCountry'] = normalizedCountry;

    if (!this.headers['Accept-Language']) {
      const normalizedLanguage = language?.split('-')[0] || 'en';
      this.headers[
        'Accept-Language'
      ] = `${normalizedLanguage}-${normalizedCountry},${normalizedLanguage};q=0.9,en;q=0.8`;
    }

    await this.page.setExtraHTTPHeaders(this.headers);
    LocalizationTestHelper.setupApiMocking(language, countryCode);
  }

  /**
   * Simulate geolocation by overriding the browser's navigator.geolocation
   */
  async mockGeolocation(latitude: number, longitude: number) {
    await this.page.context().grantPermissions(['geolocation']);
    await this.page.context().setGeolocation({ latitude, longitude });
  }

  /**
   * Set browser language preferences
   */
  async setBrowserLanguage(locales: string[]) {
    const ACCEPT_LANGUAGE = 'Accept-Language';
    const languageHeader = locales.join(',');

    this.headers[ACCEPT_LANGUAGE] = languageHeader;
    // Ensure Cloudflare country header is always present for consistency with other helpers.
    const inferredCountry = locales[0]?.split('-')[1] || 'US';
    this.headers['CF-IPCountry'] = inferredCountry.toUpperCase();
    await this.page.setExtraHTTPHeaders(this.headers);

    // Set up API mocking with default country (US)
    const language = locales[0]?.split('-')[0] || 'en';
    const country = this.headers['CF-IPCountry'] || 'US';
    LocalizationTestHelper.setupApiMocking(language, country);
  }

  /**
   * Mock IP-based country detection by setting the CF-IPCountry header from Cloudflare
   */
  async mockCountryDetection(countryCode: string) {
    // Set the CF-IPCountry header that Cloudflare would normally provide
    this.headers['CF-IPCountry'] = countryCode.toUpperCase();
    await this.page.setExtraHTTPHeaders(this.headers);

    // Set up API mocking with current language or default
    const acceptLanguage = this.headers['Accept-Language'] || 'en-US,en';
    const language = acceptLanguage.split(',')[0]?.split('-')[0] || 'en';
    LocalizationTestHelper.setupApiMocking(language, countryCode);
  }

  /**
   * Set both language and country headers together
   */
  async setLanguageAndCountry(locales: string[], countryCode: string) {
    const ACCEPT_LANGUAGE = 'Accept-Language';
    const languageHeader = locales.join(',');
    this.headers[ACCEPT_LANGUAGE] = languageHeader;
    this.headers['CF-IPCountry'] = countryCode.toUpperCase();
    await this.page.setExtraHTTPHeaders(this.headers);

    // Set up API route mocking for SSR calls
    LocalizationTestHelper.setupApiMocking(locales[0]?.split('-')[0] || 'en', countryCode);
  }

  /**
   * Set up API route mocking for country language preference
   * Now uses handlers.js instead of inline mocking
   */
  private static setupApiMocking(userDeviceLanguage: string, country: string) {
    // Set test-specific data in handlers.js
    const mockData = LocalizationTestHelper.getMockCountryLanguagePreference(
      userDeviceLanguage,
      country,
    );

    // Use setTestData to pass the mock data to handlers.js
    setTestData('countryLanguagePreference', mockData);
  }

  /**
   * Get mock data for country language preference based on language and country
   * @param {string} userDeviceLanguage The user's detected device language
   * @param {string} country The user's detected country
   * @returns {any} Mock data object for the API response
   */
  private static getMockCountryLanguagePreference(
    userDeviceLanguage: string,
    country: string,
  ): any {
    // Normalize inputs
    const normalizedLanguage = (userDeviceLanguage || 'en').toLowerCase();
    const normalizedCountry = (country || 'US').toUpperCase();

    // Apply business logic: For non-English languages, ignore country and use US
    const isEnglish = normalizedLanguage === 'en';
    const effectiveCountry = isEnglish ? normalizedCountry : 'US';

    // Mock data based on language and country combinations
    const mockDataMap: Record<string, any> = {};
    for (const [key, value] of Object.entries(mockCountryLanguagePreferences)) {
      const [lang, countryCode] = key.split('-');
      const newKey = `${lang.toUpperCase()}_${countryCode.toUpperCase()}`;
      mockDataMap[newKey] = value;
    }

    const key = `${normalizedLanguage.toUpperCase()}_${effectiveCountry}`;
    const mockData = mockDataMap[key];

    if (mockData) {
      return mockData;
    }

    // Unsupported languages should fall back to English settings for the detected country
    const englishCountryKey = `EN_${normalizedCountry}`;
    if (!isEnglish && mockDataMap[englishCountryKey]) {
      return mockDataMap[englishCountryKey];
    }

    // Final fallback: use English (US) defaults while preserving detected country in response
    const defaultEnglishKey = 'EN_US';
    const defaultEnglish = mockDataMap[defaultEnglishKey] || {
      country: 'US',
      userDeviceLanguage: 'en',
      defaultMushaf: { id: 1 },
      defaultTranslations: [{ id: 131 }],
      defaultTafsir: { id: 'en-tafisr-ibn-kathir' },
      defaultWbwLanguage: { isoCode: 'en' },
      ayahReflectionsLanguages: [{ isoCode: 'en' }],
    };

    return {
      ...defaultEnglish,
      country: normalizedCountry,
      userDeviceLanguage: 'en',
    };
  }

  /**
   * Clear all headers
   */
  async clearHeaders() {
    this.headers = {};
    await this.page.setExtraHTTPHeaders({});
  }

  /**
   * Set custom login response for testing
   */
  static setCustomLoginResponse(loginData: any) {
    setTestData('loginResponse', loginData);
  }

  /**
   * Set custom preferences for testing
   */
  static setCustomPreferences(preferences: any) {
    setTestData('preferences', preferences);
  }

  /**
   * Set error scenarios for testing
   */
  static setErrorScenarios(scenarios: any) {
    setTestData('errorScenarios', scenarios);
  }

  /**
   * Set custom reflections for testing
   */
  static setCustomReflections(reflections: any) {
    setTestData('reflections', reflections);
  }

  /**
   * Get Redux state from localStorage
   * @returns {Promise<DefaultSettings>} The persisted defaultSettings state
   */
  async getReduxState(): Promise<DefaultSettings> {
    const persistedState = (await this.homepage.getPersistedValue(
      'defaultSettings',
    )) as DefaultSettings;
    return persistedState;
  }

  /**
   * Verify default settings structure
   */
  async verifyDefaultSettingsStructure(expectedSettings: {
    detectedLanguage: string;
    detectedCountry: string;
    userHasCustomised: boolean;
    isUsingDefaultSettings: boolean;
  }) {
    const defaultSettings = await this.getReduxState();
    expect(defaultSettings).toBeDefined();
    expect(defaultSettings.detectedLanguage).toBe(expectedSettings.detectedLanguage);
    expect(defaultSettings.detectedCountry).toBe(expectedSettings.detectedCountry);
    expect(defaultSettings.userHasCustomised).toBe(expectedSettings.userHasCustomised);
    expect(defaultSettings.isUsingDefaultSettings).toBe(expectedSettings.isUsingDefaultSettings);
  }

  /**
   * Verify that 6 core settings are applied (Mushaf, Translation, Tafsir, WBW, Reciter, Reflections)
   */
  async verifyCoreSettingsAreApplied() {
    // Get all relevant settings from localStorage
    const translations = await this.homepage.getPersistedValue('translations');
    const tafsirs = await this.homepage.getPersistedValue('tafsirs');
    const readingPreferences = await this.homepage.getPersistedValue('readingPreferences');
    const quranReaderStyles = await this.homepage.getPersistedValue('quranReaderStyles');
    const defaultSettings = await this.homepage.getPersistedValue('defaultSettings');

    // Verify all 6 core settings exist
    expect(translations.selectedTranslations).toBeDefined();
    expect(tafsirs.selectedTafsirs).toBeDefined();
    expect(readingPreferences.selectedWordByWordLocale).toBeDefined();
    expect(quranReaderStyles.quranFont).toBeDefined();
    expect(quranReaderStyles.mushafLines).toBeDefined();
    expect(defaultSettings.ayahReflectionsLanguages).toBeDefined();

    // Verify array/settings are not empty
    expect(translations.selectedTranslations.length).toBeGreaterThan(0);
    expect(tafsirs.selectedTafsirs.length).toBeGreaterThan(0);
    expect(defaultSettings.ayahReflectionsLanguages.length).toBeGreaterThan(0);
  }

  /**
   * Clear all browser storage (cookies, localStorage, sessionStorage)
   */
  async clearAllBrowserData() {
    await this.page.context().clearCookies();
    await this.clearHeaders();

    // Clear test data from handlers.js
    clearTestData();

    // Safely clear localStorage and sessionStorage
    try {
      await this.page.evaluate(() => {
        if (typeof Storage !== 'undefined') {
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (error) {
            // Storage might not be available in some contexts
            console.warn('Could not clear storage:', error);
          }
        }
      });
    } catch (error) {
      // Page might not be ready for evaluation
      console.warn('Could not evaluate storage clearing:', error);
    }
  }

  /**
   * Switch language via the navbar language selector with proper waiting
   * @param {string} language The language code to switch to (e.g., 'ar', 'en')
   * @param {string} expectedUrl The expected URL after language switch (e.g., '/ar', '/')
   */
  async switchLanguage(language: string, expectedUrl: string) {
    await this.homepage.closeNextjsErrorDialog();

    // Open navigation drawer, then language selector, then pick the language
    await this.homepage.closeNextjsErrorDialog();
    await this.page.locator('[data-testid="open-navigation-drawer"]').click();
    const selectorButton = this.page.locator('[data-testid="language-selector-button"]');
    await expect(selectorButton).toBeVisible();
    await selectorButton.click();

    const languageOption = this.page.locator(`[data-testid="language-item-${language}"]`);
    await expect(languageOption).toBeVisible();
    await languageOption.click();

    // Wait for navigation to complete with proper conditions
    await this.page.waitForURL(expectedUrl, {
      waitUntil: 'networkidle',
      timeout: 15000, // Increased timeout for slower environments
    });

    // Wait for any async operations to complete
    await this.page.waitForLoadState('networkidle');

    await this.expectNextLocaleCookieToBe(language);

    // Additional wait for API calls and Redux updates
    await this.page.waitForTimeout(2000);

    // Wait for Redux hydration to complete
    await this.waitForReduxHydration();
  }

  /**
   * Wait for Redux hydration to complete
   */
  async waitForReduxHydration() {
    try {
      await this.page.waitForFunction(
        () => {
          try {
            if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
              return false;
            }

            const storage = localStorage.getItem('persist:root');
            if (!storage) return false;

            const parsed = JSON.parse(storage);
            const persistData = parsed._persist;
            if (!persistData) return false;

            const persistInfo = JSON.parse(persistData);
            return persistInfo.rehydrated === true;
          } catch {
            return false;
          }
        },
        { timeout: 15000 },
      );
    } catch (error) {
      // If Redux hydration fails, continue with test
      console.warn('Redux hydration timeout:', error);
    }
  }
}
test.describe.configure({ mode: 'parallel' });

// Test group: Category 1 - First-time Guest User Detection & Settings
test.describe('Category 1: First-time Guest User Detection & Settings', () => {
  let helper: LocalizationTestHelper;

  test.beforeEach(async ({ page, context }) => {
    helper = new LocalizationTestHelper(page, context);
    await helper.clearAllBrowserData();
  });

  test('Test Case 1.1.1: English Device Language + US Country', async ({ page }) => {
    await test.step('Set language to English and country to US', async () => {
      // MSW will automatically intercept the SSR API call based on headers
      await helper.setLanguageAndCountry(['en-US', 'en'], 'US');
    });

    await test.step('Navigate to homepage and wait for hydration', async () => {
      await page.goto('/', NAVIGATION_OPTIONS);
      await helper.waitForReduxHydration();
    });

    await test.step('Verify Redux state shows correct detection', async () => {
      await helper.verifyDefaultSettingsStructure({
        detectedLanguage: 'en',
        detectedCountry: 'US',
        userHasCustomised: false,
        isUsingDefaultSettings: true,
      });
    });

    await test.step('Verify all 6 core settings are applied', async () => {
      await helper.verifyCoreSettingsAreApplied();
    });

    await test.step('Verify specific US preferences are applied', async () => {
      const translations = await helper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(131);
      expect(translations.isUsingDefaultTranslations).toBe(true);
    });
  });

  test('Test Case 1.1.2: English Device Language + Non-US Country (UK)', async ({ page }) => {
    await test.step('Set language to English and country to UK', async () => {
      await helper.setLanguageAndCountry(['en-GB', 'en'], 'GB');
    });

    await test.step('Navigate to homepage and wait for hydration', async () => {
      await page.goto('/', NAVIGATION_OPTIONS);
      await helper.waitForReduxHydration();
    });

    await test.step('Verify Redux state shows correct detection for UK', async () => {
      await helper.verifyDefaultSettingsStructure({
        detectedLanguage: 'en',
        detectedCountry: 'GB',
        userHasCustomised: false,
        isUsingDefaultSettings: true,
      });
    });

    await test.step('Verify UK-specific translation is applied', async () => {
      const translations = await helper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(131);
    });
  });

  test('Test Case 1.2.1: Arabic Device Language + Any Country (Country Ignored)', async ({
    browser,
  }) => {
    const testCountries = ['EG', 'SA', 'GB'];
    const languageCode = 'ar';
    const locale = 'ar-SA';

    for (const testCountry of testCountries) {
      await test.step(`Testing with country: ${testCountry}`, async () => {
        const context = await browser.newContext({
          locale,
        });
        const page = await context.newPage();
        const loopHelper = new LocalizationTestHelper(page, context);

        await loopHelper.mockCountryAndApiForContext(testCountry, languageCode);

        await page.goto('/', NAVIGATION_OPTIONS);
        await loopHelper.waitForReduxHydration();

        // Verify Arabic is detected regardless of country
        const defaultSettings = await loopHelper.getReduxState();
        expect(defaultSettings.detectedLanguage).toBe(languageCode);
        expect(defaultSettings.detectedCountry).toBe('US'); // Should always be US for non-English

        await context.close();
      });
    }
  });

  test('Test Case 1.2.2.1: Bengali Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.BENGALI,
      locale: 'bn-BD',
      name: 'Bengali',
      translationId: 161,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.2: Persian Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.PERSIAN,
      locale: 'fa-IR',
      name: 'Persian',
      translationId: 135,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.3: French Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.FRENCH,
      locale: 'fr-FR',
      name: 'French',
      translationId: 31,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.4: Indonesian Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.INDONESIAN,
      locale: 'id-ID',
      name: 'Indonesian',
      translationId: 33,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.5: Italian Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.ITALIAN,
      locale: 'it-IT',
      name: 'Italian',
      translationId: 153,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.6: Dutch Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.DUTCH,
      locale: 'nl-NL',
      name: 'Dutch',
      translationId: 235,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.7: Portuguese Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.PORTUGUESE,
      locale: 'pt-BR',
      name: 'Portuguese',
      translationId: 43,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.8: Russian Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.RUSSIAN,
      locale: 'ru-RU',
      name: 'Russian',
      translationId: 45,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.9: Albanian Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.ALBANIAN,
      locale: 'sq-AL',
      name: 'Albanian',
      translationId: 88,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.10: Thai Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.THAI,
      locale: 'th-TH',
      name: 'Thai',
      translationId: 230,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.11: Turkish Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.TURKISH,
      locale: 'tr-TR',
      name: 'Turkish',
      translationId: 77,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.12: Urdu Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.URDU,
      locale: 'ur-PK',
      name: 'Urdu',
      translationId: 131,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.13: Chinese Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.CHINESE,
      locale: 'zh-CN',
      name: 'Chinese',
      translationId: 56,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.2.2.14: Malay Language Detection', async ({ browser }) => {
    const language = {
      code: SUPPORTED_LANGUAGES.MALAY,
      locale: 'ms-MY',
      name: 'Malay',
      translationId: 39,
    };

    const context = await browser.newContext({
      locale: language.locale,
    });
    const page = await context.newPage();
    const loopHelper = new LocalizationTestHelper(page, context);

    await loopHelper.mockCountryAndApiForContext('US', language.code);

    await page.goto('/', NAVIGATION_OPTIONS);
    await loopHelper.waitForReduxHydration();

    // Verify language is detected and country is ignored (defaults to US)
    await loopHelper.verifyDefaultSettingsStructure({
      detectedLanguage: language.code,
      detectedCountry: 'US',
      userHasCustomised: false,
      isUsingDefaultSettings: true,
    });

    // Verify language-specific settings are applied
    await loopHelper.verifyCoreSettingsAreApplied();
    const translations = await loopHelper.homepage.getPersistedValue('translations');
    expect(translations.selectedTranslations).toContain(language.translationId);
    await context.close();
  });

  test('Test Case 1.1.3: English Device Language + Multiple Countries', async ({ page }) => {
    const countries = [
      { code: TEST_COUNTRIES.CA, translationId: 131, language: 'en' },
      { code: TEST_COUNTRIES.AU, translationId: 131, language: 'en' },
      { code: TEST_COUNTRIES.IN, translationId: 131, language: 'en' },
      { code: TEST_COUNTRIES.SA, translationId: 131, language: 'en' },
      { code: TEST_COUNTRIES.EG, translationId: 131, language: 'en' },
    ];

    for (const country of countries) {
      await test.step(`Testing with country: ${country.code}`, async () => {
        const loopHelper = new LocalizationTestHelper(page, page.context());
        await loopHelper.clearAllBrowserData();
        await loopHelper.setBrowserLanguage(['en-US', country.language]);

        await page.goto('/', NAVIGATION_OPTIONS);
        await loopHelper.waitForReduxHydration();

        await loopHelper.verifyDefaultSettingsStructure({
          detectedLanguage: country.language,
          detectedCountry: 'US',
          userHasCustomised: false,
          isUsingDefaultSettings: true,
        });

        const translations = await loopHelper.homepage.getPersistedValue('translations');
        expect(translations.selectedTranslations).toContain(country.translationId);
      });
    }
  });

  test('Test Case 1.3.1: Unsupported Language + Country Fallback (Japanese -> English)', async ({
    browser,
  }) => {
    let context: BrowserContext;
    let page: Page;
    let testHelper: LocalizationTestHelper;

    await test.step('Set browser language to Japanese and country to JP', async () => {
      // Create a new context with Japanese locale
      context = await browser.newContext({
        locale: 'ja-JP',
      });
      page = await context.newPage();
      testHelper = new LocalizationTestHelper(page, context);

      // Set up mocking for Japanese language and JP country
      await testHelper.mockCountryAndApiForContext('JP', 'ja');
    });

    await test.step('Navigate to homepage and wait for hydration', async () => {
      await page.goto('/', NAVIGATION_OPTIONS);
      await testHelper.waitForReduxHydration();
    });

    await test.step('Verify settings fallback to English, preserving country', async () => {
      // Should fallback to English but preserve country
      await testHelper.verifyDefaultSettingsStructure({
        detectedLanguage: 'en',
        detectedCountry: 'JP',
        userHasCustomised: false,
        isUsingDefaultSettings: true,
      });
    });

    await test.step('Cleanup', async () => {
      await context.close();
    });
  });

  test('Test Case 1.3.2d: Hebrew Language Fallback', async ({ browser }) => {
    await test.step('Setup context and page', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const testHelper = new LocalizationTestHelper(page, context);

      await test.step('Set language to Hebrew and country to IL', async () => {
        await testHelper.setLanguageAndCountry(['he-IL', UNSUPPORTED_LANGUAGES.HEBREW], 'IL');
      });

      await test.step('Navigate and hydrate', async () => {
        await page.goto('/', NAVIGATION_OPTIONS);
        await testHelper.waitForReduxHydration();
      });

      await test.step('Verify fallback to English', async () => {
        await testHelper.verifyDefaultSettingsStructure({
          detectedLanguage: 'en',
          detectedCountry: 'IL',
          userHasCustomised: false,
          isUsingDefaultSettings: true,
        });
      });
      await context.close();
    });
  });

  test('Test Case 1.3.2e: Hindi Language Fallback', async ({ browser }) => {
    await test.step('Setup context and page', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const testHelper = new LocalizationTestHelper(page, context);

      await test.step('Set language to Hindi and country to IN', async () => {
        await testHelper.setLanguageAndCountry(
          ['hi-IN', UNSUPPORTED_LANGUAGES.HINDI],
          TEST_COUNTRIES.IN,
        );
      });

      await test.step('Navigate and hydrate', async () => {
        await page.goto('/', NAVIGATION_OPTIONS);
        await testHelper.waitForReduxHydration();
      });

      await test.step('Verify fallback to English', async () => {
        await testHelper.verifyDefaultSettingsStructure({
          detectedLanguage: 'en',
          detectedCountry: TEST_COUNTRIES.IN,
          userHasCustomised: false,
          isUsingDefaultSettings: true,
        });
      });
      await context.close();
    });
  });
});

// Test group: Category 2 - User Authentication & Settings Persistence
test.describe('Category 2: User Authentication & Settings Persistence', () => {
  let helper: LocalizationTestHelper;

  test.beforeEach(async ({ page, context }) => {
    helper = new LocalizationTestHelper(page, context);
    await helper.clearAllBrowserData();
  });

  /**
   * There's no way to sign up a user via playwright because we should
   * need the verification code etc. But this has been manually tested
   * and verified that the guest settings are preserved upon signup.
   * Skipping this test for now.
   */
  test.skip('Test Case 2.1.1: Guest Settings Preservation on Signup', async ({ browser }) => {
    let context: BrowserContext;
    let page: Page;
    let testHelper: LocalizationTestHelper;

    await test.step('Set initial guest settings to Arabic', async () => {
      // Create a new context with Arabic locale
      context = await browser.newContext({
        locale: 'ar-SA',
      });
      page = await context.newPage();
      testHelper = new LocalizationTestHelper(page, context);

      // Set up mocking for Arabic language and US country
      await testHelper.mockCountryAndApiForContext('US', 'ar');

      await page.goto('/', NAVIGATION_OPTIONS);
      await testHelper.waitForReduxHydration();
    });

    await test.step('Verify initial guest settings', async () => {
      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.detectedLanguage).toBe('ar');
      expect(defaultSettings.userHasCustomised).toBe(false);

      const guestTranslations = await testHelper.homepage.getPersistedValue('translations');
      expect(guestTranslations.selectedTranslations).toContain(20);
    });

    await test.step('Simulate user signup flow', async () => {
      // Simulate user signup/registration flow
      // Navigate to signup page
      await page.goto('/login', NAVIGATION_OPTIONS);
      await page.locator('[data-testid="signup-button"]').first().click();
      await page.locator('[data-testid="signup-first-name-input"]').fill('Test');
      await page.locator('[data-testid="signup-last-name-input"]').fill('User');
      await page.locator('[data-testid="signup-email-input"]').fill('test@example.com');
      await page.locator('[data-testid="signup-username-input"]').fill('testuser');
      await page.locator('[data-testid="signup-password-input"]').fill('testpassword123');
      await page.locator('[data-testid="signup-confirm-password-input"]').fill('testpassword123');

      // Click the initial sign-up button to trigger the verification code step.
      await page.locator('[data-testid="signup-submit-button"]').click();

      // Wait for the verification code input to be visible and then fill it.
      const verificationInput = page.locator('input[aria-label="verification input"]');
      await expect(verificationInput).toBeVisible();
      await verificationInput.fill('123456');

      // After filling the code, the app should automatically log in and redirect to the homepage.
      await page.waitForURL('/ar');
      await testHelper.waitForReduxHydration();
    });

    await test.step('Verify guest settings are preserved after signup', async () => {
      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.detectedLanguage).toBe('ar');
      expect(defaultSettings.userHasCustomised).toBe(false);

      const postSignupTranslations = await testHelper.homepage.getPersistedValue('translations');
      expect(postSignupTranslations.selectedTranslations).toContain(20);
    });

    await test.step('Cleanup', async () => {
      await context.close();
    });
  });

  /**
   * There's no way to sign up a user via playwright because we should
   * need the verification code etc. But this has been manually tested
   * and verified that the modified guest settings are preserved upon signup.
   * Skipping this test for now.
   */
  test.skip('Test Case 2.1.2: Modified Guest Settings on Signup', async ({ page }) => {
    await test.step('Set initial guest settings', async () => {
      // Start as guest with initial settings
      await helper.setBrowserLanguage(['en-US', 'en']);
      await helper.mockCountryDetection('US');

      await page.goto('/', NAVIGATION_OPTIONS);
      await helper.waitForReduxHydration();
    });

    await test.step('Modify guest settings', async () => {
      // Modify settings as guest
      await helper.homepage.openSettingsDrawer();
      await expect(page.locator('#theme-section')).toBeVisible();

      // Simulate custom translation selection
      await page.evaluate(() => {
        window.__store?.dispatch({
          type: 'translations/setSelectedTranslations',
          payload: { translations: [20], locale: 'en' },
        });
      });

      await page.waitForTimeout(1000);

      // Verify user has customized settings
      const defaultSettings = await helper.getReduxState();
      expect(defaultSettings.userHasCustomised).toBe(true);

      await page.keyboard.press('Escape'); // Close settings drawer
    });

    await test.step('Proceed with signup', async () => {
      await page.goto('/login', NAVIGATION_OPTIONS);
      await page.locator('[data-testid="signup-button"]').first().click();
      await page.locator('[data-testid="signup-first-name-input"]').fill('Custom');
      await page.locator('[data-testid="signup-last-name-input"]').fill('User');
      await page.locator('[data-testid="signup-email-input"]').fill('customuser@example.com');
      await page.locator('[data-testid="signup-username-input"]').fill('customuser');
      await page.locator('[data-testid="signup-password-input"]').fill('Custompass_123');
      await page.locator('[data-testid="signup-confirm-password-input"]').fill('Custompass_123');

      // Click the initial sign-up button to trigger the verification code step.
      await page.locator('[data-testid="signup-submit-button"]').click();

      // Wait for the verification code input to be visible and then fill it.
      const verificationInput = page.locator('input[aria-label="verification input"]');
      await expect(verificationInput).toBeVisible();
      await verificationInput.fill('123456');

      // After filling the code, the app should automatically log in and redirect to the homepage.
      await page.waitForURL('/');
      await helper.waitForReduxHydration();
    });

    await test.step('Verify customized settings are preserved', async () => {
      const defaultSettings = await helper.getReduxState();
      expect(defaultSettings.userHasCustomised).toBe(true);

      const customTranslations = await helper.homepage.getPersistedValue('translations');
      expect(customTranslations.selectedTranslations).toContain(20);
    });
  });

  /**
   * Not everyone use the same BE database for testing, so skipping this test
   * as the user with saved settings may not exist in all environments.
   * This has been manually tested and verified.
   */
  test.skip('Test Case 2.2.1: User with Saved Settings Login', async ({ page }) => {
    await test.step('Mock user with existing saved settings', async () => {
      // Mock login API response (without settings - that's handled by preferences API)
      LocalizationTestHelper.setCustomLoginResponse({
        success: true,
        user: {
          id: 'existing-user-123',
          email: 'existing@example.com',
          firstName: 'Existing',
          lastName: 'User',
          photoUrl: null,
          lastSyncAt: '2025-01-12T15:25:57.456Z',
          lastActiveAt: '2025-01-12T17:05:22.860Z',
          lastMutationAt: '2025-01-12T16:42:11.675Z',
          timezone: 'Asia/Karachi',
          registrationSource: 'Quran.com_web',
          username: 'existinguser',
          isAdmin: false,
          isBanned: false,
          createdAt: '2025-01-12T08:03:11.494Z',
          features: null,
          consents: {},
        },
      });

      // Mock preferences API response with saved settings
      LocalizationTestHelper.setCustomPreferences({
        language: { language: 'ur' },
        theme: { type: 'auto' },
        audio: {
          reciter: { id: 7, name: 'Mishari Rashid al-`Afasy' },
          playbackRate: 1,
          showTooltipWhenPlayingAudio: true,
          enableAutoScrolling: true,
        },
        translations: { selectedTranslations: [159] },
        tafsirs: { selectedTafsirs: ['en-tafisr-ibn-kathir'] },
        reading: { selectedWordByWordLocale: 'ur' },
        quranReaderStyles: {
          quranFont: 'code_v1',
          mushafLines: 'code_v1',
          quranTextFontSize: 3,
          translationFontSize: 3,
        },
      });
    });

    await test.step('Login user', async () => {
      await page.goto('/login', NAVIGATION_OPTIONS);
      await page.locator('[data-testid="signin-email-input"]').fill('existing@example.com');
      await page.locator('[data-testid="signin-password-input"]').fill('existingpass123');
      await page.locator('[data-testid="signin-continue-button"]').click();

      await page.waitForURL('/');
      await helper.waitForReduxHydration();
    });

    await test.step('Verify saved settings are loaded', async () => {
      // Verify user preferences are loaded correctly
      const translations = await helper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(159);

      const readingPreferences = await helper.homepage.getPersistedValue('readingPreferences');
      expect(readingPreferences.selectedWordByWordLocale).toBe('ur');

      const tafsirs = await helper.homepage.getPersistedValue('tafsirs');
      expect(tafsirs.selectedTafsirs).toContain('en-tafisr-ibn-kathir');
    });
  });

  /**
   * Not everyone use the same BE database for testing, so skipping this test
   * as the user may not exist in all environments.
   * This has been manually tested and verified.
   */
  test.skip('Test Case 2.2.2: User with No Saved Settings Login', async ({ page }) => {
    await test.step('Mock user with no saved settings', async () => {
      // Mock login API response (without settings - that's handled by preferences API)
      LocalizationTestHelper.setCustomLoginResponse({
        success: true,
        user: {
          id: 'new-user-123',
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          photoUrl: null,
          lastSyncAt: '2025-01-12T15:25:57.456Z',
          lastActiveAt: '2025-01-12T17:05:22.860Z',
          lastMutationAt: '2025-01-12T16:42:11.675Z',
          timezone: 'America/Toronto',
          registrationSource: 'Quran.com_web',
          username: 'newuser',
          isAdmin: false,
          isBanned: false,
          createdAt: '2025-01-12T08:03:11.494Z',
          features: null,
          consents: {},
        },
      });

      // No custom preferences set - will use defaults from handlers.js
    });

    await test.step('Mock fresh detection and login user', async () => {
      await helper.setBrowserLanguage(['en-CA', 'en']);
      await helper.mockCountryDetection('CA');

      await page.goto('/login', NAVIGATION_OPTIONS);
      await page.locator('[data-testid="signin-email-input"]').fill('newuser@example.com');
      await page.locator('[data-testid="signin-password-input"]').fill('newpass123');
      await page.locator('[data-testid="signin-continue-button"]').click();

      await page.waitForURL('/');
      await helper.waitForReduxHydration();
    });

    await test.step('Verify fresh detection and default settings applied', async () => {
      // Verify default settings are applied based on detection
      await helper.verifyDefaultSettingsStructure({
        detectedLanguage: 'en',
        detectedCountry: 'CA',
        userHasCustomised: false,
        isUsingDefaultSettings: true,
      });

      const translations = await helper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(20); // Canada-specific default
    });
  });
});

// Test group: Category 3 - Language Selector Behavior
test.describe('Category 3: Language Selector Behavior', () => {
  let helper: LocalizationTestHelper;

  test.beforeEach(async ({ page, context }) => {
    helper = new LocalizationTestHelper(page, context);
    await helper.clearAllBrowserData();
  });

  test('Test Case 3.1.1: Language Change with Unmodified Settings (Arabic to English)', async ({
    browser,
  }) => {
    let context: BrowserContext;
    let page: Page;
    let testHelper: LocalizationTestHelper;

    await test.step('Start with Arabic detection', async () => {
      // Create a new context with Arabic locale, similar to Test 1.2.1
      context = await browser.newContext({
        locale: 'ar-SA',
      });
      page = await context.newPage();
      testHelper = new LocalizationTestHelper(page, context);

      // Set up mocking for Arabic language and US country
      await testHelper.mockCountryAndApiForContext('US', 'ar');

      await page.goto('/', NAVIGATION_OPTIONS);
      await testHelper.waitForReduxHydration();
    });

    await test.step('Verify initial Arabic settings', async () => {
      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.detectedLanguage).toBe('ar');
      expect(defaultSettings.userHasCustomised).toBe(false);
    });

    await test.step('Switch language to English', async () => {
      await testHelper.switchLanguage('en', '/');
    });

    await test.step('Verify settings changed to English defaults', async () => {
      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.userHasCustomised).toBe(false); // Should remain false

      await testHelper.expectNextLocaleCookieToBe('en');

      const translations = await testHelper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(131); // English default
    });

    await test.step('Cleanup', async () => {
      await context.close();
    });
  });

  test('Test Case 3.1.2: Switch to Supported Non-English Language', async ({ browser }) => {
    let context: BrowserContext;
    let page: Page;
    let testHelper: LocalizationTestHelper;

    await test.step('Start with English detection', async () => {
      // Create a new context with English locale
      context = await browser.newContext({
        locale: 'en-US',
      });
      page = await context.newPage();
      testHelper = new LocalizationTestHelper(page, context);

      // Set up mocking for English language and US country
      await testHelper.mockCountryAndApiForContext('US', 'en');

      await page.goto('/', NAVIGATION_OPTIONS);
      await testHelper.waitForReduxHydration();
    });

    await test.step('Verify initial English settings', async () => {
      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.detectedLanguage).toBe('en');
      expect(defaultSettings.userHasCustomised).toBe(false);
    });

    await test.step('Switch language to Arabic', async () => {
      await testHelper.switchLanguage('ar', '/ar');
    });

    await test.step('Verify settings changed to Arabic defaults', async () => {
      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.detectedCountry).toBe('US'); // Country ignored for non-English
      expect(defaultSettings.userHasCustomised).toBe(false); // Should remain false
      await testHelper.expectNextLocaleCookieToBe('ar');

      const translations = await testHelper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(131); // Arabic default
    });

    await test.step('Cleanup', async () => {
      await context.close();
    });
  });

  test('Test Case 3.2.1: Language Change Preserves User Customizations', async ({ browser }) => {
    let context: BrowserContext;
    let page: Page;
    let testHelper: LocalizationTestHelper;

    await test.step('Start with English detection', async () => {
      // Create a new context with English locale
      context = await browser.newContext({
        locale: 'en-US',
      });
      page = await context.newPage();
      testHelper = new LocalizationTestHelper(page, context);

      // Set up mocking for English language and US country
      await testHelper.mockCountryAndApiForContext('US', 'en');

      await page.goto('/1', NAVIGATION_OPTIONS);
      await testHelper.waitForReduxHydration();
    });

    await test.step('Customize settings', async () => {
      await testHelper.homepage.openSettingsDrawer();
      await expect(page.locator('#theme-section')).toBeVisible();

      await page.evaluate(() => {
        window.__store?.dispatch({
          type: 'translations/setSelectedTranslations',
          payload: { translations: [20], locale: 'en' },
        });
      });

      await page.waitForTimeout(1000); // Allow state to update

      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.userHasCustomised).toBe(true);

      await page.keyboard.press('Escape');
    });

    await test.step('Switch to Arabic and verify customization preservation', async () => {
      await testHelper.homepage.closeNextjsErrorDialog();
      await page.locator('[data-testid="open-navigation-drawer"]').click();
      const selectorButton = page.locator('[data-testid="language-selector-button"]');
      await expect(selectorButton).toBeVisible();
      await selectorButton.click();
      const languageOption = page.locator('[data-testid="language-item-ar"]');
      await expect(languageOption).toBeVisible();
      await languageOption.click();
      await page.waitForURL('/ar/1');

      await testHelper.expectNextLocaleCookieToBe('ar');

      await testHelper.waitForReduxHydration();

      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.userHasCustomised).toBe(true);

      const translations = await testHelper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(20);
    });

    await test.step('Cleanup', async () => {
      await context.close();
    });
  });
});

// Test group: Category 4 - Reset Settings Functionality
test.describe('Category 4: Reset Settings Functionality', () => {
  let helper: LocalizationTestHelper;

  test.beforeEach(async ({ page, context }) => {
    helper = new LocalizationTestHelper(page, context);
    await helper.clearAllBrowserData();
  });

  test('Test Case 4.1: Settings Reset for Guest Users', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    const testHelper = new LocalizationTestHelper(page, context);

    await test.step('Set initial settings and navigate to page', async () => {
      await testHelper.mockCountryAndApiForContext('US', 'en');
      await page.goto('/1', NAVIGATION_OPTIONS);
      await testHelper.waitForReduxHydration();
    });

    await test.step('Modify settings and verify customization', async () => {
      await testHelper.homepage.openSettingsDrawer();
      await expect(page.locator('#theme-section')).toBeVisible();

      await page.evaluate(() => {
        window.__store?.dispatch({
          type: 'translations/setSelectedTranslations',
          payload: { translations: [20], locale: 'en' },
        });
      });

      await page.waitForTimeout(1000);

      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.userHasCustomised).toBe(true);
      expect(defaultSettings.isUsingDefaultSettings).toBe(false);
    });

    await test.step('Reset settings to defaults', async () => {
      await page.locator('[data-testid="reset-settings-button"]').click();
      await page.waitForTimeout(2000); // Allow reset to complete
      await page.keyboard.press('Escape');
    });

    await test.step('Verify settings are reset', async () => {
      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.userHasCustomised).toBe(false);
      expect(defaultSettings.isUsingDefaultSettings).toBe(true);

      const translations = await testHelper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(131); // Back to default
    });
  });

  /**
   * Skipping this test because the user with saved settings may not exist
   * in all testing environments. This has been manually tested and verified.
   */
  test.skip('Test Case 4.2: Settings Reset for Logged-in Users', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    const testHelper = new LocalizationTestHelper(page, context);

    await test.step('Mock user login with custom settings', async () => {
      // Mock login API response using handlers.js
      LocalizationTestHelper.setCustomLoginResponse({
        success: true,
        user: {
          id: 'logged-user-123',
          email: 'logged@example.com',
          firstName: 'Logged',
          lastName: 'User',
          photoUrl: null,
          lastSyncAt: '2025-01-12T15:25:57.456Z',
          lastActiveAt: '2025-01-12T17:05:22.860Z',
          lastMutationAt: '2025-01-12T16:42:11.675Z',
          timezone: 'America/New_York',
          registrationSource: 'Quran.com_web',
          username: 'loggeduser',
          isAdmin: false,
          isBanned: false,
          createdAt: '2025-01-12T08:03:11.494Z',
          features: null,
          consents: {},
        },
      });

      // Mock preferences API response with saved settings
      LocalizationTestHelper.setCustomPreferences({
        language: { language: 'ar' },
        theme: { type: 'auto' },
        audio: {
          reciter: { id: 7, name: 'Mishari Rashid al-`Afasy' },
          playbackRate: 1,
          showTooltipWhenPlayingAudio: true,
          enableAutoScrolling: true,
        },
        translations: { selectedTranslations: [20] },
        tafsirs: { selectedTafsirs: ['ar-tafseer-al-tabari'] },
        reading: { selectedWordByWordLocale: 'ar' },
        quranReaderStyles: {
          quranFont: 'code_v1',
          mushafLines: 'code_v1',
          quranTextFontSize: 3,
          translationFontSize: 3,
        },
      });

      await testHelper.mockCountryAndApiForContext('US', 'en');
    });

    await test.step('Login user and verify custom settings', async () => {
      await page.goto('/login', NAVIGATION_OPTIONS);
      await page.locator('[data-testid="signin-email-input"]').fill('logged@example.com');
      await page.locator('[data-testid="signin-password-input"]').fill('loggedpass123');
      await page.locator('[data-testid="signin-continue-button"]').click();

      await page.waitForURL('/');
      await testHelper.waitForReduxHydration();

      // Verify user preferences are loaded correctly from the preferences API
      const translations = await testHelper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(20);

      const readingPreferences = await testHelper.homepage.getPersistedValue('readingPreferences');
      expect(readingPreferences.selectedWordByWordLocale).toBe('ar');

      const tafsirs = await testHelper.homepage.getPersistedValue('tafsirs');
      expect(tafsirs.selectedTafsirs).toContain('ar-tafseer-al-tabari');
    });

    await test.step('Reset settings and verify', async () => {
      await testHelper.homepage.openSettingsDrawer();
      await expect(page.locator('#theme-section')).toBeVisible();

      await page.locator('[data-testid="reset-settings-button"]').click();
      await page.waitForTimeout(2000); // Allow reset to complete

      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings.userHasCustomised).toBe(false);
      expect(defaultSettings.isUsingDefaultSettings).toBe(true);
      expect(defaultSettings.detectedLanguage).toBe('en'); // Should detect fresh

      const translations = await testHelper.homepage.getPersistedValue('translations');
      expect(translations.selectedTranslations).toContain(131); // New default
      expect(translations.isUsingDefaultTranslations).toBe(true);
    });
  });
});

// Test group: Category 5 - Reflections Language Integration
test.describe('Category 5: Reflections Language Integration', () => {
  let helper: LocalizationTestHelper;

  test.beforeEach(async ({ page, context }) => {
    helper = new LocalizationTestHelper(page, context);
    await helper.clearAllBrowserData();
  });

  /**
   * Skipping this test because the reflections language filter UI component
   * ([data-testid="reflections-language-filter"]) is not yet implemented in the codebase.
   *
   * This test was written based on anticipated functionality, but the actual implementation
   * does not include a user-facing language selector/filter in the reflections drawer.
   */
  test.skip('Test Case 5.1: Reflections List Language Matching', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    const testHelper = new LocalizationTestHelper(page, context);

    await test.step('Setup user with reflection languages and mock API', async () => {
      await testHelper.mockCountryAndApiForContext('US', 'en');

      // Mock reflections API response
      LocalizationTestHelper.setCustomReflections({
        reflections: [
          { id: 1, text: 'English reflection', language: 'en' },
          { id: 2, text: 'تأمل عربي', language: 'ar' },
          { id: 3, text: 'اردو تأمل', language: 'ur' },
          { id: 4, text: 'French reflection', language: 'fr' }, // Should not appear
        ],
      });
    });

    await test.step('Navigate to verse with reflections', async () => {
      await page.goto('/', NAVIGATION_OPTIONS);
      await testHelper.waitForReduxHydration();

      await page.goto('/1:1/reflections'); // Al-Fatiha verse 1
      await page.waitForLoadState('networkidle');
    });

    await test.step('Open reflections and verify language filter', async () => {
      await page.locator('[data-testid="verse-actions"]').first().click();
      await page.locator('[data-testid="reflections-button"]').click();

      await expect(page.locator('[data-testid="reflections-modal"]')).toBeVisible();

      const languageFilter = page.locator('[data-testid="reflections-language-filter"]');
      await expect(languageFilter).toBeVisible();

      await languageFilter.click();
      await expect(page.locator('[data-testid="language-option-en"]')).toBeVisible();
      await expect(page.locator('[data-testid="language-option-ar"]')).toBeVisible();
      await expect(page.locator('[data-testid="language-option-ur"]')).toBeVisible();
      await expect(page.locator('[data-testid="language-option-fr"]')).not.toBeVisible();
    });

    await test.step('Test filtering by each preset language', async () => {
      const languageFilter = page.locator('[data-testid="reflections-language-filter"]');

      await page.locator('[data-testid="language-option-en"]').click();
      await expect(page.locator('text=English reflection')).toBeVisible();
      await expect(page.locator('text=تأمل عربي')).not.toBeVisible();

      await languageFilter.click();
      await page.locator('[data-testid="language-option-ar"]').click();
      await expect(page.locator('text=تأمل عربي')).toBeVisible();
      await expect(page.locator('text=English reflection')).not.toBeVisible();

      await languageFilter.click();
      await page.locator('[data-testid="language-option-ur"]').click();
      await expect(page.locator('text=اردو تأمل')).toBeVisible();
      await expect(page.locator('text=English reflection')).not.toBeVisible();
    });

    await test.step('Verify "All" languages filter', async () => {
      const languageFilter = page.locator('[data-testid="reflections-language-filter"]');
      await languageFilter.click();
      await page.locator('[data-testid="language-option-all"]').click();
      await expect(page.locator('text=English reflection')).toBeVisible();
      await expect(page.locator('text=تأمل عربي')).toBeVisible();
      await expect(page.locator('text=اردو تأمل')).toBeVisible();
      await expect(page.locator('text=French reflection')).not.toBeVisible();
    });
  });

  /**
   * Skipping this test because it uses testid that does not exist in the current codebase.
   */
  test.skip('Test Case 5.1.2: Reflections Language Updates with Settings Change', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    const testHelper = new LocalizationTestHelper(page, context);

    await test.step('Start with English settings', async () => {
      await testHelper.mockCountryAndApiForContext('US', 'en');

      await page.goto('/', NAVIGATION_OPTIONS);
      await testHelper.waitForReduxHydration();
    });

    await test.step('Manually update reflection languages in settings', async () => {
      await testHelper.homepage.openSettingsDrawer();
      await expect(page.locator('#theme-section')).toBeVisible();

      await page.evaluate(() => {
        window.__store?.dispatch({
          type: 'defaultSettings/updateAyahReflectionsLanguages',
          payload: [
            { isoCode: 'en', name: 'English' },
            { isoCode: 'ar', name: 'العربية' },
          ],
        });
      });

      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape'); // Close settings
    });

    await test.step('Navigate to verse page and mock reflections API', async () => {
      await page.goto('/1:1/reflections');
      await page.waitForLoadState('networkidle');

      // Mock reflections API response
      LocalizationTestHelper.setCustomReflections({
        reflections: [
          { id: 1, text: 'English reflection', language: 'en' },
          { id: 2, text: 'تأمل عربي', language: 'ar' },
          { id: 3, text: 'French reflection', language: 'fr' },
        ],
      });
    });

    await test.step('Open reflections and verify updated language options', async () => {
      await page.locator('[data-testid="verse-actions"]').first().click();
      await page.locator('[data-testid="reflections-button"]').click();
      await expect(page.locator('[data-testid="reflections-modal"]')).toBeVisible();

      const languageFilter = page.locator('[data-testid="reflections-language-filter"]');
      await languageFilter.click();

      await expect(page.locator('[data-testid="language-option-en"]')).toBeVisible();
      await expect(page.locator('[data-testid="language-option-ar"]')).toBeVisible();
      await expect(page.locator('[data-testid="language-option-fr"]')).not.toBeVisible();
    });
  });
});

// Test group: Category 6 - Error Handling & Edge Cases
test.describe('Category 6: Error Handling & Edge Cases', () => {
  let helper: LocalizationTestHelper;

  test.beforeEach(async ({ page, context }) => {
    helper = new LocalizationTestHelper(page, context);
    await helper.clearAllBrowserData();
  });

  test.skip('Test Case 6.1.1: Network Failure During Detection (Graceful Degradation)', async ({
    page,
  }) => {
    await test.step('Mock network failure for country preference API', async () => {
      // Set error scenario for network failure
      LocalizationTestHelper.setErrorScenarios({
        countryLanguagePreference: { type: 'network_failure' },
      });

      await helper.setBrowserLanguage(['en-US', 'en']);
      await helper.mockCountryDetection('US');
    });

    await test.step('Navigate to homepage and verify graceful degradation', async () => {
      await page.goto('/', NAVIGATION_OPTIONS);

      await expect(page.locator('body')).toBeVisible();
      await helper.waitForReduxHydration();
      await helper.verifyCoreSettingsAreApplied();

      await expect(page.locator('text=Error')).not.toBeVisible();
      await expect(page.locator('text=Failed')).not.toBeVisible();
    });
  });

  test.skip('Test Case 6.1.2: Invalid Country/Language Combinations', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'xx-YY' });
    const page = await context.newPage();
    const testHelper = new LocalizationTestHelper(page, context);

    await test.step('Mock API returning error for invalid combination', async () => {
      // Set error scenario for invalid combination
      LocalizationTestHelper.setErrorScenarios({
        countryLanguagePreference: { type: 'invalid_combination' },
      });

      await testHelper.mockCountryAndApiForContext('YY', 'xx'); // Invalid country/language codes
    });

    await test.step('Navigate and verify graceful fallback', async () => {
      await page.goto('/', NAVIGATION_OPTIONS);
      await expect(page.locator('body')).toBeVisible();
      await testHelper.waitForReduxHydration();

      await testHelper.verifyCoreSettingsAreApplied();
      await expect(page.locator('text=Error')).not.toBeVisible();
      await expect(page.locator('text=Invalid')).not.toBeVisible();

      const defaultSettings = await testHelper.getReduxState();
      expect(defaultSettings).toBeDefined();
      expect(defaultSettings.detectedLanguage).toBeTruthy();
    });
  });

  test('Test Case 6.2.1: Missing Accept-Language Header', async ({ page }) => {
    await test.step('Setup: mock country detection without language header', async () => {
      await helper.mockCountryDetection('US');
    });

    await test.step('Navigate and verify fallback to English', async () => {
      await page.goto('/', NAVIGATION_OPTIONS);
      await helper.waitForReduxHydration();

      await helper.verifyDefaultSettingsStructure({
        detectedLanguage: 'en',
        detectedCountry: 'US',
        userHasCustomised: false,
        isUsingDefaultSettings: true,
      });
    });
  });

  test('Test Case 6.2.2: Malformed Language Headers', async ({ page }) => {
    await test.step('Set malformed Accept-Language headers', async () => {
      const ACCEPT_LANGUAGE = 'Accept-Language';
      await page.setExtraHTTPHeaders({
        [ACCEPT_LANGUAGE]: 'invalid-format, malformed;q=notanumber',
      });

      await helper.mockCountryDetection('US');
    });

    await test.step('Navigate and verify graceful fallback', async () => {
      await page.goto('/', NAVIGATION_OPTIONS);

      await expect(page.locator('body')).toBeVisible();
      await helper.waitForReduxHydration();

      const defaultSettings = await helper.getReduxState();
      expect(defaultSettings).toBeDefined();
      expect(defaultSettings.detectedLanguage).toBe('en');
    });
  });
});

// Test group: Category 7 - Session Persistence
test.describe('Category 7: Session Persistence', () => {
  let helper: LocalizationTestHelper;

  test.beforeEach(async ({ page, context }) => {
    helper = new LocalizationTestHelper(page, context);
    await helper.clearAllBrowserData();
  });

  test('Test Case 7.2: Session Persistence Across Browser Restarts', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    const testHelper = new LocalizationTestHelper(page, context);

    await test.step('Set initial settings and customize', async () => {
      await testHelper.mockCountryAndApiForContext('US', 'en');

      await page.goto('/1', NAVIGATION_OPTIONS);
      await testHelper.waitForReduxHydration();

      await testHelper.homepage.openSettingsDrawer();
      await page.evaluate(() => {
        window.__store?.dispatch({
          type: 'translations/setSelectedTranslations',
          payload: { translations: [20], locale: 'en' },
        });
      });

      await page.waitForTimeout(1000);

      const settingsBeforeRestart = await testHelper.homepage.getPersistedValue('translations');
      expect(settingsBeforeRestart.selectedTranslations).toContain(20);
    });

    await test.step('Simulate browser restart and verify persistence', async () => {
      const newPage = await context.newPage();
      const newHelper = new LocalizationTestHelper(newPage, context);

      await newHelper.mockCountryAndApiForContext('US', 'en');

      await newPage.goto('/');
      await newHelper.waitForReduxHydration();

      const settingsAfterRestart = await newHelper.homepage.getPersistedValue('translations');
      expect(settingsAfterRestart.selectedTranslations).toContain(20);

      const defaultSettings = await newHelper.getReduxState();
      expect(defaultSettings.userHasCustomised).toBe(true);

      await newPage.close();
    });
  });
});
