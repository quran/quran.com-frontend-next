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

      // Open the bookmark modal
      await firstVerse.getByLabel('Bookmark').click();

      // If reading bookmark is already set, remove it first to ensure consistent state
      const removeReadingBookmark = page.getByRole('button', {
        name: /Remove my Reading Bookmark/i,
      });
      if ((await removeReadingBookmark.count()) > 0) {
        await removeReadingBookmark.click();
      }

      // Set as reading bookmark (works for guests and logged-in users)
      await page.getByText(/Set as.*Reading Bookmark/i).click();

      // Close the modal (Done)
      const doneButton = page.getByRole('button', { name: /Done/i });
      await expect(doneButton).toBeVisible();
      await doneButton.click();

      // After setting, the verse should be marked as bookmarked
      await expect(firstVerse.getByLabel('Bookmarked')).toBeVisible();

      // Reload the page
      await homePage.reload();

      // Verify the first verse is still bookmarked
      const reloadedVerse = page.getByTestId(getVerseTestId('1:1'));
      await expect(reloadedVerse.getByLabel('Bookmarked')).toBeVisible();
    },
  );
});
