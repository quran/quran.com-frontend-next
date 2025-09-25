import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1');
});
test.describe('Bookmark verses', () => {
  test('bookmarking a verse is persistent', async ({ page }) => {
    // Verify the first verse is not bookmarked
    const firstVerse = page.getByTestId('verse-1:1');
    await expect(firstVerse.getByLabel('Bookmarked')).not.toBeVisible();

    // Click the bookmark button to add a bookmark
    await firstVerse.getByLabel('Bookmark').click();

    await page.waitForTimeout(1500); // wait for the bookmark to be added

    // Reload the page
    await homePage.reload();

    // Verify the first verse is still bookmarked
    await expect(firstVerse.getByLabel('Bookmarked')).toBeVisible();
  });
});
