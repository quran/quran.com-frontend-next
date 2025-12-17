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
      await expect(page.getByTestId('save-bookmark-modal-title')).toBeVisible();
      await page.getByLabel('Set as my Reading Bookmark').click();
      await expect(page.getByTestId('reading-bookmark-new-label')).toBeVisible();

      await homePage.reload();

      await firstVerse.getByLabel('Bookmark').click();
      await expect(page.getByLabel('Remove my Reading Bookmark')).toBeVisible();
    },
  );
});
