import type { Page } from '@playwright/test';

import { mockCountryLanguagePreferences } from '@/tests/mocks/data';
import { clearTestData, setTestData } from '@/tests/mocks/msw/handlers.js';

export const isLocalBaseUrl = (): boolean => {
  const base = process.env.PLAYWRIGHT_TEST_BASE_URL;
  return !base || base.includes('localhost') || base.includes('127.0.0.1');
};

const getMockCountryLanguagePreference = (language: string, country: string) => {
  const normalizedLanguage = (language || 'en').toLowerCase();
  const normalizedCountry = (country || 'US').toUpperCase();

  const isEnglish = normalizedLanguage === 'en';
  const effectiveCountry = isEnglish ? normalizedCountry : 'US';
  const key = `${normalizedLanguage}-${effectiveCountry}`;

  return mockCountryLanguagePreferences[key] || mockCountryLanguagePreferences['en-US'];
};

export const setupLanguageAndCountry = async (
  page: Page,
  {
    language,
    country,
  }: {
    language: string;
    country: string;
  },
): Promise<void> => {
  const normalizedLanguage = (language || 'en').toLowerCase();
  const normalizedCountry = (country || 'US').toUpperCase();

  await page.setExtraHTTPHeaders({
    'Accept-Language': `${normalizedLanguage}-${normalizedCountry},${normalizedLanguage};q=0.9,en;q=0.8`,
    'CF-IPCountry': normalizedCountry,
  });

  setTestData(
    'countryLanguagePreference',
    getMockCountryLanguagePreference(normalizedLanguage, normalizedCountry),
  );
};

export const clearLocalTestState = async (page: Page): Promise<void> => {
  clearTestData();
  await page.context().clearCookies();

  // New Playwright pages start at about:blank where accessing Storage throws a SecurityError.
  // Each test gets a fresh browser context by default, so storage is already empty in that case.
  if (page.url() === 'about:blank') return;

  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore cross-origin / opaque origin storage access errors.
    }
  });
};

export const getExpectedCountryPreference = (language: string, country: string) =>
  getMockCountryLanguagePreference(language, country);
