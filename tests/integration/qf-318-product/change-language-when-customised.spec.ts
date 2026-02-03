import { test, expect } from '@playwright/test';

import { selectNavigationDrawerLanguage } from '@/tests/helpers/language';
import {
  clearLocalTestState,
  isLocalBaseUrl,
  setupLanguageAndCountry,
} from '@/tests/helpers/qf318-product';
import { getPersistedSlice, waitForReduxHydration } from '@/tests/helpers/qf318-state';

test.describe('QF-318 (local) — language change preserves customised settings', () => {
  test.skip(!isLocalBaseUrl(), 'Local deterministic test (requires localhost baseURL)');

  test.beforeEach(async ({ page }) => {
    await clearLocalTestState(page);
  });

  test(
    'If user customised settings, switching locale preserves preferences',
    { tag: ['@qf318-product', '@language'] },
    async ({ page }) => {
      await setupLanguageAndCountry(page, { language: 'en', country: 'US' });

      await page.goto('/1', { waitUntil: 'networkidle' });
      await waitForReduxHydration(page);

      await page.evaluate(() => {
        (window as any).__store?.dispatch({
          type: 'translations/setSelectedTranslations',
          payload: { translations: [20], locale: 'en' },
        });
      });

      await expect
        .poll(async () => {
          const settings = await getPersistedSlice<any>(page, 'defaultSettings');
          return settings?.userHasCustomised;
        })
        .toBe(true);

      await selectNavigationDrawerLanguage(page, 'ar');
      await page.waitForURL(/\/ar\/1/);
      await waitForReduxHydration(page);

      const translations = await getPersistedSlice<any>(page, 'translations');
      expect(translations?.selectedTranslations).toContain(20);

      const settingsAfter = await getPersistedSlice<any>(page, 'defaultSettings');
      expect(settingsAfter?.userHasCustomised).toBe(true);
    },
  );
});
