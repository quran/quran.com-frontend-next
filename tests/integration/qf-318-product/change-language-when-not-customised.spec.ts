import { test, expect } from '@playwright/test';

import { selectNavigationDrawerLanguage } from '@/tests/helpers/language';
import {
  clearLocalTestState,
  getExpectedCountryPreference,
  isLocalBaseUrl,
  setupLanguageAndCountry,
} from '@/tests/helpers/qf318-product';
import { getPersistedSlice, waitForReduxHydration } from '@/tests/helpers/qf318-state';

test.describe('QF-318 (local) — language change updates defaults when not customised', () => {
  test.skip(!isLocalBaseUrl(), 'Local deterministic test (requires localhost baseURL)');

  test.beforeEach(async ({ page }) => {
    await clearLocalTestState(page);
  });

  test(
    'If user has not customised settings, switching locale applies defaults',
    { tag: ['@qf318-product', '@language'] },
    async ({ page }) => {
      await setupLanguageAndCountry(page, { language: 'en', country: 'US' });

      await page.goto('/1', { waitUntil: 'networkidle' });
      await waitForReduxHydration(page);

      const defaultSettings = await getPersistedSlice<any>(page, 'defaultSettings');
      expect(defaultSettings?.userHasCustomised).toBe(false);

      await selectNavigationDrawerLanguage(page, 'ar');
      await page.waitForURL(/\/ar\/1/);
      await waitForReduxHydration(page);

      const expected = getExpectedCountryPreference('ar', 'US');
      const expectedIds = expected.defaultTranslations.map((t: { id: number }) => t.id);

      const translations = await getPersistedSlice<any>(page, 'translations');
      expectedIds.forEach((id: number) => {
        expect(translations?.selectedTranslations).toContain(id);
      });
    },
  );
});
