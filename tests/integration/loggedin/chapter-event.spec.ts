import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

test.describe('Chapter Event Display (Logged In)', () => {
  let homePage: Homepage;

  test.beforeEach(async ({ page, context }) => {
    homePage = new Homepage(page, context);
  });

  test(
    'Chapter event should NOT be visible when user is logged in AND enrolled',
    { tag: ['@fast', '@surah', '@chapter-event'] },
    async ({ page }) => {
      // Mock API response for enrollment status (Enrolled)
      await page.route('**/goal/status?type=RAMADAN_CHALLENGE', async (route) => {
        await route.fulfill({
          json: {
            data: {
              isEnrolled: true,
            },
          },
        });
      });

      // Navigate to Surah Al-Mulk (67)
      await homePage.goTo('/67');

      // Verify chapter event is NOT visible
      const chapterEvent = page.getByTestId(TestId.QURAN_READER_CHAPTER_EVENT);
      await expect(chapterEvent).not.toBeVisible();
    },
  );

  test(
    'Chapter event should be visible when user is logged in but NOT enrolled',
    { tag: ['@fast', '@surah', '@chapter-event'] },
    async ({ page }) => {
      // Mock API response for enrollment status (NOT Enrolled)
      await page.route('**/goal/status?type=RAMADAN_CHALLENGE', async (route) => {
        await route.fulfill({
          json: {
            data: {
              isEnrolled: false,
            },
          },
        });
      });

      // Navigate to Surah Al-Mulk (67)
      await homePage.goTo('/67');

      // Verify chapter event is visible
      const chapterEvent = page.getByTestId(TestId.QURAN_READER_CHAPTER_EVENT);
      await expect(chapterEvent).toBeVisible();
    },
  );
});
