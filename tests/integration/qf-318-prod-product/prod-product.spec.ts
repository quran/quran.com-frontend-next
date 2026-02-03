import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

import { loginWithEmail } from '@/tests/helpers/auth';
import { ensureEnglishLanguage, selectNavigationDrawerLanguage } from '@/tests/helpers/language';
import { isProdEdgeBaseUrl } from '@/tests/helpers/qf318-edge';
import { getPersistedSlice, waitForReduxHydration } from '@/tests/helpers/qf318-state';
import { openSettingsDrawer, selectAnyTranslationPreference } from '@/tests/helpers/settings';

const hasCreds = () => Boolean(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);

const login = async (page: Page) => {
  await loginWithEmail(page, {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
  });
};

const getSelectedTranslations = async (page: Page): Promise<number[]> => {
  const translations = await getPersistedSlice<any>(page, 'translations');
  return translations?.selectedTranslations || [];
};

const getDefaultSettings = async (page: Page) => getPersistedSlice<any>(page, 'defaultSettings');

const applyNewTranslation = async (page: Page): Promise<number> => {
  const id = await selectAnyTranslationPreference(page);
  const parsedId = Number(id);
  await expect
    .poll(async () => (await getSelectedTranslations(page)).includes(parsedId))
    .toBe(true);
  return parsedId;
};

const gotoEnglishReaderPage = async (page: Page) => {
  await page.goto('/en/1', { waitUntil: 'domcontentloaded' });
  await waitForReduxHydration(page);
  await ensureEnglishLanguage(page);
};

const resetSettingsAndReturnToEnglish = async (page: Page) => {
  await gotoEnglishReaderPage(page);
  await openSettingsDrawer(page);
  await page.locator('[data-testid="reset-settings-button"]').click();
  await page.waitForTimeout(2000);
  await page.keyboard.press('Escape');

  await expect
    .poll(async () => {
      const settings = await getDefaultSettings(page);
      return settings?.userHasCustomised;
    })
    .toBe(false);

  await ensureEnglishLanguage(page);
  await waitForReduxHydration(page);
};

const fetchCountryLanguagePreference = async (
  request: APIRequestContext,
  { language, country }: { language: string; country: string },
) => {
  const url = `/api/proxy/content/api/qdc/resources/country_language_preference?user_device_language=${language}&country=${country}`;
  const res = await request.get(url, { headers: { accept: 'application/json' } });
  expect(res.ok()).toBe(true);
  return res.json();
};

test.describe('QF-318 (prod) — product regression smoke', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');
  test.describe.configure({ mode: 'serial', timeout: 120000 });
  if (process.env.PLAYWRIGHT_STORAGE_STATE) {
    test.use({ storageState: process.env.PLAYWRIGHT_STORAGE_STATE });
  }

  test(
    'Logged-in preference persists across reload',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      test.skip(!hasCreds(), 'Missing TEST_USER_EMAIL/TEST_USER_PASSWORD');

      await login(page);
      await gotoEnglishReaderPage(page);

      try {
        const targetId = await applyNewTranslation(page);

        await page.reload({ waitUntil: 'domcontentloaded' });
        await waitForReduxHydration(page);

        const after = await getSelectedTranslations(page);
        expect(after).toContain(targetId);
      } finally {
        await resetSettingsAndReturnToEnglish(page);
      }
    },
  );

  test(
    'Logged-in: language switch preserves customised settings',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      test.skip(!hasCreds(), 'Missing TEST_USER_EMAIL/TEST_USER_PASSWORD');

      await login(page);
      await gotoEnglishReaderPage(page);

      try {
        const targetId = await applyNewTranslation(page);

        await selectNavigationDrawerLanguage(page, 'ar');
        await page.waitForURL(/\/ar/);
        await waitForReduxHydration(page);

        const after = await getSelectedTranslations(page);
        expect(after).toContain(targetId);

        const settings = await getDefaultSettings(page);
        expect(settings?.userHasCustomised).toBe(true);
      } finally {
        await resetSettingsAndReturnToEnglish(page);
      }
    },
  );

  test(
    'Logged-in: language switch updates defaults when not customised',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      test.skip(!hasCreds(), 'Missing TEST_USER_EMAIL/TEST_USER_PASSWORD');

      await login(page);
      await gotoEnglishReaderPage(page);

      try {
        await resetSettingsAndReturnToEnglish(page);

        await selectNavigationDrawerLanguage(page, 'ar');
        await page.waitForURL(/\/ar/);
        await waitForReduxHydration(page);

        const apiDefaults = await fetchCountryLanguagePreference(page.request, {
          language: 'ar',
          country: 'US',
        });
        const expectedIds = (apiDefaults?.defaultTranslations || []).map((t: any) => t.id);

        const translations = await getSelectedTranslations(page);
        expectedIds.forEach((id: number) => {
          expect(translations).toContain(id);
        });
      } finally {
        await resetSettingsAndReturnToEnglish(page);
      }
    },
  );

  test(
    'Guest: language switch updates defaults when not customised',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/en/1', { waitUntil: 'domcontentloaded' });
      await waitForReduxHydration(page);

      const settings = await getDefaultSettings(page);
      expect(settings?.userHasCustomised).toBe(false);

      await selectNavigationDrawerLanguage(page, 'ar');
      await page.waitForURL(/\/ar/);
      await waitForReduxHydration(page);

      const apiDefaults = await fetchCountryLanguagePreference(page.request, {
        language: 'ar',
        country: 'US',
      });
      const expectedIds = (apiDefaults?.defaultTranslations || []).map((t: any) => t.id);

      const translations = await getSelectedTranslations(page);
      expectedIds.forEach((id: number) => {
        expect(translations).toContain(id);
      });
    },
  );

  test(
    'Guest: language switch preserves customised settings',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/en/1', { waitUntil: 'domcontentloaded' });
      await waitForReduxHydration(page);

      const targetId = await applyNewTranslation(page);

      await selectNavigationDrawerLanguage(page, 'ar');
      await page.waitForURL(/\/ar/);
      await waitForReduxHydration(page);

      const after = await getSelectedTranslations(page);
      expect(after).toContain(targetId);
    },
  );
});
