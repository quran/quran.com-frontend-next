import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
  await homepage.goTo('/calendar');
});

test(
  'Selecting a week should scroll to the top of the page',
  { tag: ['@quran-in-a-year'] },
  async ({ page }) => {
    // Scroll to the bottom of the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Click on a week button
    const weekButton = page.getByLabel('Week 1 of Shawwal');
    await weekButton.click();

    // Wait for the scroll to complete by polling the scroll position
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(100);
  },
);
