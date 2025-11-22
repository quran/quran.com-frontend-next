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
    await this.page.locator('[data-testid="language-selector-button-navbar"]').click();
    const option = this.page.locator(`[data-testid="language-selector-item-${language}"]`);
    await expect(option).toBeVisible();
    await option.click();
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

test.describe('Localization scenarios - Switch Language', () => {
  const createScenarioHelper = async (browser: any) => {
    const context = await browser.newContext({ locale: 'ur-PK' });
    const page = await context.newPage();
    const helper = new LocalizationScenarioHelper(page, context);
    return { helper, page, context };
  };

  test(
    'Guest from Pakistan with Urdu locale is redirected to /ur and uses IndoPak font',
    { tag: ['@localization', '@language-detection', '@urdu'] },
    async ({ browser }) => {
      const { helper, page, context } = await createScenarioHelper(browser);

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
      const { helper, page, context } = await createScenarioHelper(browser);

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
      const { helper, page, context } = await createScenarioHelper(browser);

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
});

test.describe('Localization scenarios - Learning Plans', () => {
  const createScenarioHelper = async (browser: any, locale: string) => {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    const helper = new LocalizationScenarioHelper(page, context);
    return { helper, page, context };
  };

  test(
    'Guest from France sees French lessons first',
    { tag: ['@localization', '@learning-plans', '@french'] },
    async ({ browser }) => {
      const { helper, page, context } = await createScenarioHelper(browser, 'fr-FR');

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
      const { helper, page, context } = await createScenarioHelper(browser, 'ur-PK');

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
      const { helper, page, context } = await createScenarioHelper(browser, 'ar-EG');

      await helper.visitPage();
      await expect(page).toHaveURL(/\/ar(\?|$)/);

      const defaultSettings = await helper.getDefaultSettings();
      expect(defaultSettings.learningPlanLanguageIsoCodes).toEqual(['ar']);

      await context.close();
    },
  );
});

test.describe('Localization scenarios - Quran Reflect', () => {
  const createScenarioHelper = async (browser: any, locale: string) => {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    const helper = new LocalizationScenarioHelper(page, context);
    return { helper, page, context };
  };

  test(
    'Guest from France sees French and English reflection',
    { tag: ['@localization', '@reflections', '@french'] },
    async ({ browser }) => {
      const { helper, page, context } = await createScenarioHelper(browser, 'fr-FR');

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
      const { helper, page, context } = await createScenarioHelper(browser, 'tr-TR');

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
      const { helper, page, context } = await createScenarioHelper(browser, 'ms-MY');

      await helper.visitPage('/1:1/reflections');
      await expect(page).toHaveURL(/\/ms\/1:1\/reflections(\?|$)/);

      const defaultSettings = await helper.getDefaultSettings();
      expect(defaultSettings.ayahReflectionsLanguageIsoCodes).toEqual(['ms']);

      await context.close();
    },
  );
});

test.describe('Localization scenarios - Account', () => {
  const createScenarioHelper = async (browser: any, locale: string) => {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    const helper = new LocalizationScenarioHelper(page, context);
    return { helper, page, context };
  };

  test(
    'Login to an account changes language',
    { tag: ['@auth', '@login-user', '@localization'] },

    async ({ browser }) => {
      const { helper, page } = await createScenarioHelper(browser, 'ur-PK');

      test.skip(
        !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
        'No credentials provided',
      );

      try {
        await helper.setLanguageAndCountry(['ur-PK', 'ur'], 'PK');
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
      const { helper, page } = await createScenarioHelper(browser, 'ur-PK');

      test.skip(
        !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
        'No credentials provided',
      );

      try {
        await helper.setLanguageAndCountry(['ur-PK', 'ur'], 'PK');
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

        await page.locator('[data-testid="profile-avatar-button"]').click();
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
