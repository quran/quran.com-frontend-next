import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1');
});

test.describe('Reading Bookmark', () => {
  test(
    'Reading bookmark persists after page reload',
    { tag: ['@slow', '@bookmarks', '@persistence'] },
    async ({ page }) => {
      const firstVerse = page.getByTestId('verse-1:1');
      await expect(firstVerse.getByLabel('Bookmark')).toBeVisible();
      await firstVerse.getByLabel('Bookmark').click();
      await expect(page.getByText('Save verse 1:1')).toBeVisible();
      await page.getByText('Set as my Reading Bookmark').click();
      await expect(page.getByText('New')).toBeVisible();

      await homePage.reload();

      await firstVerse.getByLabel('Bookmark').click();
      await expect(page.getByText('Remove my Reading Bookmark')).toBeVisible();
    },
  );
});
