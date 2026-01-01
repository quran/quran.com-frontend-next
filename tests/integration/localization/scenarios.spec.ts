/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-lines */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable @typescript-eslint/naming-convention */
import { test, expect, BrowserContext, Page } from '@playwright/test';
import dotenv from 'dotenv';

import { mockCountryLanguagePreferences } from '../../mocks/data';
import { setTestData } from '../../mocks/msw/handlers.js';
import Homepage from '../../POM/home-page';

const NAVIGATION_OPTIONS = { waitUntil: 'domcontentloaded', timeout: 300000 } as const;
const INDOPAK_FONT = 'text_indopak';

dotenv.config();

const { TEST_USER_EMAIL } = process.env;
const { TEST_USER_PASSWORD } = process.env;

const createTestUserPreferences = () => ({
  language: { language: 'fr' },
  theme: { type: 'sepia' },
  audio: {
    reciter: { id: 7, name: 'Mishari Rashid al-`Afasy' },
    playbackRate: 1,
    showTooltipWhenPlayingAudio: true,
    enableAutoScrolling: true,
  },
  translations: { selectedTranslations: [131] },
  tafsirs: { selectedTafsirs: ['en-tafisr-ibn-kathir'] },
  reading: { selectedWordByWordLocale: 'fr' },
  quranReaderStyles: {
    quranFont: 'code_v1',
    mushafLines: '16_lines',
    quranTextFontSize: 3,
    translationFontSize: 3,
  },
});

class LocalizationScenarioHelper {
  private page: Page;

  public homepage: Homepage;

  private headers: Record<string, string> = {};

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.homepage = new Homepage(page, context);
  }

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
      console.warn('Redux hydration wait failed', error);
    }
  }

  async visitPage(webPage: string = '/') {
    await this.page.goto(webPage, NAVIGATION_OPTIONS);
    await this.waitForReduxHydration();
    await this.homepage.closeNextjsErrorDialog();
  }

  async getDefaultSettings() {
    return (await this.homepage.getPersistedValue('defaultSettings')) as {
      ayahReflectionsLanguageIsoCodes: string[];
      learningPlanLanguageIsoCodes: string[];
      detectedLanguage: string;
      detectedCountry: string;
    };
  }

  async switchLanguage(language: string) {
    await this.homepage.closeNextjsErrorDialog();
    const selectorButton = this.page.getByTestId('language-selector-button-navbar');
    await expect(selectorButton).toBeVisible();
    await selectorButton.click();
    const option = this.page.getByTestId(`language-selector-item-${language}`);
    await expect(option).toBeVisible();
    await option.click({ force: true });
    await this.page.waitForLoadState('networkidle');
    await this.waitForReduxHydration();
  }

  async setLanguageAndCountry(locales: string[], countryCode: string) {
    const ACCEPT_LANGUAGE = 'Accept-Language';
    const languageHeader = locales.join(',');
    this.headers[ACCEPT_LANGUAGE] = languageHeader;
    this.headers['CF-IPCountry'] = countryCode.toUpperCase();
    await this.page.setExtraHTTPHeaders(this.headers);
    LocalizationScenarioHelper.setupApiMocking(locales[0]?.split('-')[0] || 'en', countryCode);
  }

  private static setupApiMocking(userDeviceLanguage: string, country: string) {
    const mockData = LocalizationScenarioHelper.getMockCountryLanguagePreference(
      userDeviceLanguage,
      country,
    );
    setTestData('countryLanguagePreference', mockData);
  }

  private static getMockCountryLanguagePreference(
    userDeviceLanguage: string,
    country: string,
  ): any {
    const normalizedLanguage = (userDeviceLanguage || 'en').toLowerCase();
    const normalizedCountry = (country || 'US').toUpperCase();
    const isEnglish = normalizedLanguage === 'en';
    const effectiveCountry = isEnglish ? normalizedCountry : 'US';

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

    const englishCountryKey = `EN_${normalizedCountry}`;
    if (!isEnglish && mockDataMap[englishCountryKey]) {
      return mockDataMap[englishCountryKey];
    }

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
}

// Reusable helper factories
const createSimpleScenarioHelper = async (browser: any, locale: string = 'ur-PK') => {
  const context = await browser.newContext({ locale });
  const page = await context.newPage();
  const helper = new LocalizationScenarioHelper(page, context);
  const countryCode = locale.split('-')[1] || 'US';
  await helper.setLanguageAndCountry([locale], countryCode);
  return { helper, page, context };
};

const createCountryScenarioHelper = async (browser: any, locale: string, countryCode: string) => {
  const context = await browser.newContext({ locale });
  const page = await context.newPage();
  const helper = new LocalizationScenarioHelper(page, context);
  await helper.setLanguageAndCountry([locale], countryCode);
  return { helper, page, context };
};

const createLanguageDetectionHelper = async (
  browser: any,
  locale: string,
  countryCode: string = 'XX',
) => {
  const context = await browser.newContext({ locale });
  const page = await context.newPage();
  const helper = new LocalizationScenarioHelper(page, context);
  await helper.setLanguageAndCountry([locale], countryCode);
  return { helper, page, context };
};

// Skip all tests on mobile
test.beforeEach(({ isMobile }) => {
  test.skip(isMobile, 'Tests are skipped on mobile');
});

test.describe('Localization scenarios - Switch Language', () => {
  test(
    'Guest from Pakistan with Urdu locale is redirected to /ur and uses IndoPak font',
    { tag: ['@localization', '@language-detection', '@urdu'] },
    async ({ browser }) => {
      const { helper, page, context } = await createSimpleScenarioHelper(browser, 'ur-PK');

      await helper.visitPage();

      await expect(page).toHaveURL(/\/ur(\?|$)/);

      const quranReaderStyles = await helper.homepage.getPersistedValue('quranReaderStyles');
      expect(quranReaderStyles.quranFont).toBe(INDOPAK_FONT);

      await context.close();
    },
  );

  test(
    'Pakistan Urdu guest switching to French loses IndoPak defaults',
    { tag: ['@localization', '@language-switch', '@urdu', '@french'] },
    async ({ browser }) => {
      const { helper, page, context } = await createSimpleScenarioHelper(browser, 'ur-PK');

      await helper.visitPage();
      await expect(page).toHaveURL(/\/ur(\?|$)/);

      const initialStyles = await helper.homepage.getPersistedValue('quranReaderStyles');
      expect(initialStyles.quranFont).toBe(INDOPAK_FONT);

      await helper.switchLanguage('fr');
      await expect(page).toHaveURL(/\/fr(\?|$)/);

      const stylesAfterSwitch = await helper.homepage.getPersistedValue('quranReaderStyles');
      expect(stylesAfterSwitch.quranFont).not.toBe(INDOPAK_FONT);

      await context.close();
    },
  );

  test(
    'Customized Pakistan Urdu guest keeps settings after switching language',
    { tag: ['@localization', '@language-switch', '@settings-persistence', '@urdu'] },
    async ({ browser }) => {
      const { helper, page, context } = await createSimpleScenarioHelper(browser, 'ur-PK');

      await helper.visitPage('/1');
      await expect(page).toHaveURL(/\/ur\/1(\?|$)/);
      await helper.homepage.openSettingsDrawer();
      await expect(page.locator('#theme-section')).toBeVisible();
      await page.locator('[data-testid="sepia-button"]').click();
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');

      const themeBeforeSwitch = await helper.homepage.getPersistedValue('theme');
      expect(themeBeforeSwitch.type).toBe('sepia');

      await helper.switchLanguage('fr');
      await expect(page).toHaveURL(/\/fr\/1(\?|$)/);

      const quranReaderStyles = await helper.homepage.getPersistedValue('quranReaderStyles');
      expect(quranReaderStyles.quranFont).toBe(INDOPAK_FONT);

      const themeAfterSwitch = await helper.homepage.getPersistedValue('theme');
      expect(themeAfterSwitch.type).toBe('sepia');

      await context.close();
    },
  );

  test(
    'Guest with English interface but Egypt location is redirected to /ar',
    { tag: ['@localization', '@language-detection', '@egypt', '@english'] },
    async ({ browser }) => {
      const context = await browser.newContext({ locale: 'en-US' });
      const page = await context.newPage();
      const helper = new LocalizationScenarioHelper(page, context);

      // Inject Egypt country header
      await helper.setLanguageAndCountry(['en-US', 'en'], 'EG');

      await helper.visitPage();

      // Should redirect to /ar because Egypt defaults to Arabic
      await expect(page).toHaveURL(/\/ar(\?|$)/);

      await context.close();
    },
  );
});

test.describe('Localization scenarios - Learning Plans', () => {
  test(
    'Guest from France sees French lessons first',
    { tag: ['@localization', '@learning-plans', '@french'] },
    async ({ browser }) => {
      const { helper, page, context } = await createSimpleScenarioHelper(browser, 'fr-FR');

      await helper.visitPage();
      await expect(page).toHaveURL(/\/fr(\?|$)/);

      const defaultSettings = await helper.getDefaultSettings();
      expect(defaultSettings.learningPlanLanguageIsoCodes).toEqual(['fr']);

      await context.close();
    },
  );

  test(
    'Guest from Pakistan sees English lessons first',
    { tag: ['@localization', '@learning-plans', '@urdu'] },
    async ({ browser }) => {
      const { helper, page, context } = await createSimpleScenarioHelper(browser, 'ur-PK');

      await helper.visitPage();
      await expect(page).toHaveURL(/\/ur(\?|$)/);

      const defaultSettings = await helper.getDefaultSettings();
      expect(defaultSettings.learningPlanLanguageIsoCodes).toEqual(['en']);

      await context.close();
    },
  );

  test(
    'Guest from Egypt with Arabic locale sees Arabic lessons first',
    { tag: ['@localization', '@learning-plans', '@arabic'] },
    async ({ browser }) => {
      const { helper, page, context } = await createSimpleScenarioHelper(browser, 'ar-EG');

      await helper.visitPage();
      await expect(page).toHaveURL(/\/ar(\?|$)/);

      const defaultSettings = await helper.getDefaultSettings();
      expect(defaultSettings.learningPlanLanguageIsoCodes).toEqual(['ar']);

      await context.close();
    },
  );
});

test.describe('Localization scenarios - Quran Reflect', () => {
  test(
    'Guest from France sees French and English reflection',
    { tag: ['@localization', '@reflections', '@french'] },
    async ({ browser }) => {
      const { helper, page, context } = await createSimpleScenarioHelper(browser, 'fr-FR');

      await helper.visitPage('/1:1/reflections');
      await expect(page).toHaveURL(/\/fr\/1:1\/reflections(\?|$)/);

      const defaultSettings = await helper.getDefaultSettings();
      expect(defaultSettings.ayahReflectionsLanguageIsoCodes).toEqual(['fr']);

      await context.close();
    },
  );

  test(
    'Guest from Turkey sees Arabic & English reflection',
    { tag: ['@localization', '@reflections', '@turkish'] },
    async ({ browser }) => {
      const { helper, page, context } = await createSimpleScenarioHelper(browser, 'tr-TR');

      await helper.visitPage('/1:1/reflections');
      await expect(page).toHaveURL(/\/1:1\/reflections(\?|$)/);

      const defaultSettings = await helper.getDefaultSettings();
      expect(defaultSettings.ayahReflectionsLanguageIsoCodes).toEqual(['ar', 'en']);

      await context.close();
    },
  );

  test(
    'Guest from Malaysia sees Malay reflection',
    { tag: ['@localization', '@reflections', '@malay'] },
    async ({ browser }) => {
      const { helper, page, context } = await createSimpleScenarioHelper(browser, 'ms-MY');

      await helper.visitPage('/1:1/reflections');
      await expect(page).toHaveURL(/\/ms\/1:1\/reflections(\?|$)/);

      const defaultSettings = await helper.getDefaultSettings();
      expect(defaultSettings.ayahReflectionsLanguageIsoCodes).toEqual(['ms']);

      await context.close();
    },
  );
});

test.describe('Localization scenarios - Account', () => {
  test.beforeAll(async ({ browser }) => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
      'No credentials provided',
    );

    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    const helper = new LocalizationScenarioHelper(page, context);

    try {
      await page.goto('/login', NAVIGATION_OPTIONS);
      await helper.waitForReduxHydration();

      const authButtons = page.getByTestId('auth-buttons');
      const continueWithEmailButton = authButtons.getByText('Email');
      await continueWithEmailButton.click();

      await page.getByTestId('signin-email-input').fill(TEST_USER_EMAIL || '');
      await page.getByTestId('signin-password-input').fill(TEST_USER_PASSWORD || '');

      await Promise.all([
        page.waitForURL(/\/(([a-z]{2}(\/|\?|$))|(\?|$))/),
        page.getByTestId('signin-continue-button').click(),
      ]);

      await expect(page.getByTestId('profile-avatar-button')).toBeVisible();

      const isFrenchUrl = /\/fr(\/|\?|$)/.test(page.url());
      if (!isFrenchUrl) {
        await helper.switchLanguage('fr');
        await page.waitForURL(/\/fr(\/|\?|$)/);
      }
    } finally {
      await context.close();
    }
  });

  test(
    'Login to an account changes language',
    { tag: ['@auth', '@login-user', '@localization'] },

    async ({ browser }) => {
      const { helper, page } = await createSimpleScenarioHelper(browser, 'ur-PK');

      test.skip(
        !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
        'No credentials provided',
      );

      try {
        setTestData('preferences', createTestUserPreferences());

        await helper.visitPage('/login');

        // click on `email-login-button` button
        await page.locator('[data-testid="email-login-button"]').click();

        await page.locator('[data-testid="signin-email-input"]').fill(TEST_USER_EMAIL);
        await page.locator('[data-testid="signin-password-input"]').fill(TEST_USER_PASSWORD);

        await Promise.all([
          page.waitForURL(/\/fr(\?|$)/),
          page.locator('[data-testid="signin-continue-button"]').click(),
        ]);

        await helper.waitForReduxHydration();

        const theme = await helper.homepage.getPersistedValue('theme');
        expect(theme.type).toBe('sepia');
      } finally {
        setTestData('preferences', null);
      }
    },
  );

  test(
    'Logging out keeps localized language and theme',
    { tag: ['@auth', '@logout', '@localization', '@settings-persistence'] },
    async ({ browser }) => {
      const { helper, page } = await createSimpleScenarioHelper(browser, 'ur-PK');

      test.skip(
        !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
        'No credentials provided',
      );

      try {
        setTestData('preferences', createTestUserPreferences());

        await helper.visitPage('/login');
        await page.locator('[data-testid="email-login-button"]').click();

        await page.locator('[data-testid="signin-email-input"]').fill(TEST_USER_EMAIL);
        await page.locator('[data-testid="signin-password-input"]').fill(TEST_USER_PASSWORD);

        await Promise.all([
          page.waitForURL(/\/fr(\?|$)/),
          page.locator('[data-testid="signin-continue-button"]').click(),
        ]);

        await helper.waitForReduxHydration();

        await page.locator('[data-testid="profile-avatar-button"]').first().click();
        await page.locator('[data-testid="profile-menu-item-logout"]').click();

        await page.waitForURL(/\/fr(\?|$)/);
        await helper.waitForReduxHydration();

        const theme = await helper.homepage.getPersistedValue('theme');
        expect(theme.type).toBe('sepia');
      } finally {
        setTestData('preferences', null);
      }
    },
  );
});

test.describe('Localization scenarios - Country/Language Detection', () => {
  const countryDetectionTests = [
    {
      countryCode: 'DZ',
      expectedLocale: 'ar',
      country: 'Algeria',
      language: 'Arabic',
      tags: ['@localization', '@country-detection', '@algeria', '@arabic'],
    },
    {
      countryCode: 'BH',
      expectedLocale: 'ar',
      country: 'Bahrain',
      language: 'Arabic',
      tags: ['@localization', '@country-detection', '@bahrain', '@arabic'],
    },
    {
      countryCode: 'BD',
      expectedLocale: 'bn',
      country: 'Bangladesh',
      language: 'Bengali',
      tags: ['@localization', '@country-detection', '@bangladesh', '@bengali'],
    },
    {
      countryCode: 'BE',
      expectedLocale: 'fr',
      country: 'Belgium',
      language: 'French',
      tags: ['@localization', '@country-detection', '@belgium', '@french'],
    },
    {
      countryCode: 'BR',
      expectedLocale: 'pt',
      country: 'Brazil',
      language: 'Portuguese',
      tags: ['@localization', '@country-detection', '@brazil', '@portuguese'],
    },
    {
      countryCode: 'TR',
      expectedLocale: 'tr',
      country: 'Turkey',
      language: 'Turkish',
      tags: ['@localization', '@country-detection', '@turkey', '@turkish'],
    },
    {
      countryCode: 'MY',
      expectedLocale: 'ms',
      country: 'Malaysia',
      language: 'Malay',
      tags: ['@localization', '@country-detection', '@malaysia', '@malay'],
    },
    {
      countryCode: 'RU',
      expectedLocale: 'ru',
      country: 'Russia',
      language: 'Russian',
      tags: ['@localization', '@country-detection', '@russia', '@russian'],
    },
    {
      countryCode: 'ES',
      expectedLocale: 'es',
      country: 'Spain',
      language: 'Spanish',
      tags: ['@localization', '@country-detection', '@spain', '@spanish'],
    },
    {
      countryCode: 'ID',
      expectedLocale: 'id',
      country: 'Indonesia',
      language: 'Indonesian',
      tags: ['@localization', '@country-detection', '@indonesia', '@indonesian'],
    },
  ];

  for (const { countryCode, expectedLocale, country, tags } of countryDetectionTests) {
    test(
      `English speaker in ${country} is redirected to /${expectedLocale}`,
      { tag: tags },
      async ({ browser }) => {
        const { helper, page, context } = await createCountryScenarioHelper(
          browser,
          'en-US',
          countryCode,
        );
        await helper.visitPage();
        await expect(page).toHaveURL(new RegExp(`\\/${expectedLocale}(\\?|$)`));
        await context.close();
      },
    );
  }

  test(
    'English speaker in Turkey switches to Turkish language',
    { tag: ['@localization', '@country-detection', '@language-switch', '@turkey', '@turkish'] },
    async ({ browser }) => {
      const { helper, page, context } = await createCountryScenarioHelper(browser, 'en-US', 'TR');

      await helper.visitPage();
      await expect(page).toHaveURL(/\/tr(\?|$)/);

      await helper.switchLanguage('en');
      await expect(page).toHaveURL(/\/(\?|$)/);

      await context.close();
    },
  );
});

test.describe('Localization scenarios - Device Language Detection (Any Country)', () => {
  const deviceLanguageTests = [
    {
      locale: 'ar-SA',
      expectedPath: '/ar',
      language: 'Arabic',
      tags: ['@localization', '@device-language-detection', '@arabic'],
    },
    {
      locale: 'fr-FR',
      expectedPath: '/fr',
      language: 'French',
      tags: ['@localization', '@device-language-detection', '@french'],
    },
    {
      locale: 'tr-TR',
      expectedPath: '/tr',
      language: 'Turkish',
      tags: ['@localization', '@device-language-detection', '@turkish'],
    },
    {
      locale: 'ur-PK',
      expectedPath: '/ur',
      language: 'Urdu',
      tags: ['@localization', '@device-language-detection', '@urdu'],
    },
    {
      locale: 'es-ES',
      expectedPath: '/es',
      language: 'Spanish',
      tags: ['@localization', '@device-language-detection', '@spanish'],
    },
  ];

  for (const { locale, expectedPath, language, tags } of deviceLanguageTests) {
    test(
      `${language} device language is detected regardless of country`,
      { tag: tags },
      async ({ browser }) => {
        const { helper, page, context } = await createLanguageDetectionHelper(
          browser,
          locale,
          'XX',
        );
        await helper.visitPage();
        await expect(page).toHaveURL(new RegExp(`\\${expectedPath}(\\?|$)`));
        await context.close();
      },
    );
  }
});
