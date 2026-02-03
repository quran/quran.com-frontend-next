import { test, expect } from '@playwright/test';

import {
  clearLocalTestState,
  getExpectedCountryPreference,
  isLocalBaseUrl,
  setupLanguageAndCountry,
} from '@/tests/helpers/qf318-product';
import { getPersistedSlice, waitForReduxHydration } from '@/tests/helpers/qf318-state';
import { openSettingsDrawer } from '@/tests/helpers/settings';

test.describe('QF-318 (local) — reset settings', () => {
  test.skip(!isLocalBaseUrl(), 'Local deterministic test (requires localhost baseURL)');

  test.beforeEach(async ({ page }) => {
    await clearLocalTestState(page);
  });

  test(
    'Reset settings restores defaults from detection',
    { tag: ['@qf318-product', '@reset'] },
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

      await openSettingsDrawer(page);
      await page.locator('[data-testid="reset-settings-button"]').click();
      await page.waitForTimeout(2000);
      await page.keyboard.press('Escape');

      await expect
        .poll(async () => {
          const settings = await getPersistedSlice<any>(page, 'defaultSettings');
          return settings?.userHasCustomised;
        })
        .toBe(false);

      const expected = getExpectedCountryPreference('en', 'US');
      const expectedIds = expected.defaultTranslations.map((t: { id: number }) => t.id);

      const translations = await getPersistedSlice<any>(page, 'translations');
      expectedIds.forEach((id: number) => {
        expect(translations?.selectedTranslations).toContain(id);
      });
    },
  );
});
