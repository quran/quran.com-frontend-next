import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { selectNavigationDrawerLanguage } from '@/tests/helpers/language';

const isLocalBaseUrl = () => {
  const base = process.env.PLAYWRIGHT_TEST_BASE_URL;
  return !base || base.includes('localhost') || base.includes('127.0.0.1');
};

test.describe('QF-318 (local) — manual locale cookie semantics', () => {
  test.skip(!isLocalBaseUrl(), 'Local deterministic test (requires localhost baseURL)');

  test(
    'Changing language sets NEXT_LOCALE and QDC_MANUAL_LOCALE=1 and persists navigation',
    { tag: ['@qf318-cache', '@language'] },
    async ({ page, context }) => {
      const homePage = new Homepage(page, context);
      await homePage.goTo();

      await homePage.closeNextjsErrorDialog();

      await Promise.all([
        selectNavigationDrawerLanguage(page, 'es'),
        page.waitForURL('**/es', { waitUntil: 'networkidle' }),
      ]);

      await expect
        .poll(async () => {
          const cookies = await context.cookies();
          return {
            nextLocale: cookies.find((c) => c.name === 'NEXT_LOCALE')?.value,
            manual: cookies.find((c) => c.name === 'QDC_MANUAL_LOCALE')?.value,
          };
        })
        .toEqual({ nextLocale: 'es', manual: '1' });

      // Navigate to another page and ensure locale sticks.
      await page.goto('/1');
      await expect(page).toHaveURL(/\/es\/1/);
    },
  );
});

