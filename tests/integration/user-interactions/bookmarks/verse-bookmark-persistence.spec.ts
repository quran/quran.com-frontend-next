import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { getVerseTestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1');
});

test.describe('Verse Bookmarking', () => {
  test(
    'Verse bookmark persists after page reload',
    { tag: ['@slow', '@bookmarks', '@persistence'] },
    async ({ page }) => {
      // Verify the first verse is not bookmarked
      const firstVerse = page.getByTestId(getVerseTestId('1:1'));
      await expect(firstVerse.getByLabel('Bookmarked')).not.toBeVisible();

      // Click the bookmark button to add a bookmark
      await firstVerse.getByLabel('Bookmark').click();
      await expect(firstVerse.getByLabel('Bookmarked')).toBeVisible();

      // Reload the page
      await homePage.reload();

      // Verify the first verse is still bookmarked
      const reloadedVerse = page.getByTestId(getVerseTestId('1:1'));
      await expect(reloadedVerse.getByLabel('Bookmarked')).toBeVisible();
    },
  );
});
