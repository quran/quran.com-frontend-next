import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
});

test.describe('@quran-in-a-year', () => {
  test(
    'Selecting a week should scroll to the top of the page',
    { tag: ['@quran-in-a-year'] },
    async ({ page }) => {
      await homepage.goTo('/calendar');

      // Ensure week button exists and is visible
      const weekButton = page.getByLabel('Week 1 of Shawwal');
      await expect(weekButton).toBeVisible();

      // Scroll to the bottom of the page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Verify we're actually at the bottom
      const scrolledToBottom = await page.evaluate(() => {
        return window.scrollY + window.innerHeight >= document.body.scrollHeight - 100;
      });
      expect(scrolledToBottom).toBe(true);

      // Click on a week button
      await weekButton.click();

      await expect
        .poll(async () => page.evaluate(() => window.scrollY), {
          timeout: 5000,
        })
        .toBeLessThan(100);
    },
  );
});
