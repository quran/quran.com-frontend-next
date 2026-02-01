/* eslint-disable react-func/max-lines-per-function */
import { expect, test } from '@playwright/test';

import {
  clickRecentTab,
  navigateToVerses,
  navigateToVerseAndWaitForTracking,
} from '@/tests/helpers/my-quran/recent-content';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

test.describe('My Quran - Recent Content (Guest)', () => {
  test(
    'Shows empty state message when guest user has no recent reads',
    { tag: ['@fast', '@my-quran', '@recent', '@guest'] },
    async ({ page }) => {
      await homePage.goTo('/my-quran');
      await clickRecentTab(page);
      await expect(page.getByTestId(TestId.MY_QURAN_RECENT_CONTENT_EMPTY_STATE)).toBeVisible();
    },
  );

  test(
    'Shows multiple recent reads sorted by newest first and limits to 10 items',
    { tag: ['@slow', '@my-quran', '@recent', '@guest', '@sorting'] },
    async ({ page, isMobile }) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const verseKeys = Array.from({ length: 15 }, (_, index) => `${index + 1}:1`);
      await navigateToVerses(homePage, verseKeys, isMobile);

      await homePage.goTo('/my-quran');
      await clickRecentTab(page);

      const recentItems = page.getByTestId(TestId.MY_QURAN_RECENT_CONTENT_ITEM);
      const itemCount = await recentItems.count();
      expect(itemCount).toBeGreaterThan(1);
      expect(itemCount).toBeLessThanOrEqual(10);

      const firstItemText = await recentItems.first().textContent();
      const lastItemText = await recentItems.last().textContent();
      expect(firstItemText).toContain('Al-Hijr');
      expect(lastItemText).toContain("Al-An'am");
    },
  );

  test(
    'Clicking on a recent read item redirects to the correct verse',
    { tag: ['@slow', '@my-quran', '@recent', '@guest', '@navigation'] },
    async ({ page, isMobile }) => {
      await navigateToVerseAndWaitForTracking(homePage, '2:255', isMobile);
      await homePage.goTo('/my-quran');
      await clickRecentTab(page);

      const recentItem = page.getByTestId(TestId.MY_QURAN_RECENT_CONTENT_ITEM).first();
      await expect(recentItem).toBeVisible();

      await Promise.all([
        page.waitForURL('**/2?startingVerse=255', { waitUntil: 'networkidle' }),
        recentItem.click(),
      ]);

      await expect(page).toHaveURL(/\/2\?startingVerse=255$/);
    },
  );
});
