import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1');
});

test.describe('SaveBookmarkModal (guest)', () => {
  test('opens and sets reading bookmark', async ({ page }) => {
    const firstVerse = page.getByTestId('verse-1:1');
    await firstVerse.getByLabel('Bookmark').click();
    await expect(page.getByTestId('save-bookmark-modal-title')).toBeVisible();
    await page.getByLabel('Set as my Reading Bookmark').click();
    await expect(page.getByTestId('reading-bookmark-new-label')).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(firstVerse.getByLabel('Bookmarked')).toBeVisible();
  });
});
