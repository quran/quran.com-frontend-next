import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/1', { waitUntil: 'networkidle' });
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
    await page.reload({ waitUntil: 'networkidle' });

    // Verify the first verse is still bookmarked
    await expect(firstVerse.getByLabel('Bookmarked')).toBeVisible();
  });
});
