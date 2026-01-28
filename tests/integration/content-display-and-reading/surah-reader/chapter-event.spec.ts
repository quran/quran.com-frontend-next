import { test, expect } from '@playwright/test';

import { ensureArabicLanguage } from '@/tests/helpers/language';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

test.describe('Chapter Event Display', () => {
  let homePage: Homepage;

  test.beforeEach(async ({ page, context }) => {
    homePage = new Homepage(page, context);
  });

  test(
    'Chapter event should be visible on Surah Al-Mulk (67)',
    { tag: ['@fast', '@surah', '@chapter-event'] },
    async ({ page }) => {
      // Navigate to Surah Al-Mulk (67)
      await homePage.goTo('/67');

      // Verify chapter event is visible
      const chapterEvent = page.getByTestId(TestId.QURAN_READER_CHAPTER_EVENT);
      await expect(chapterEvent).toBeVisible();
    },
  );

  test(
    'Chapter event should NOT be visible on other Surahs (e.g. Al-Fatihah)',
    { tag: ['@fast', '@surah', '@chapter-event'] },
    async ({ page }) => {
      // Navigate to Surah Al-Fatihah (1)
      await homePage.goTo('/1');

      // Verify chapter event is NOT visible
      const chapterEvent = page.getByTestId(TestId.QURAN_READER_CHAPTER_EVENT);
      await expect(chapterEvent).not.toBeVisible();
    },
  );

  test(
    'Chapter event should NOT be visible on Arabic language',
    { tag: ['@fast', '@surah', '@chapter-event'] },
    async ({ page }) => {
      // Navigate to Surah Al-Mulk (67) with Arabic language
      await homePage.goTo('/67');
      await ensureArabicLanguage(page);

      // Verify chapter event is NOT visible
      const chapterEvent = page.getByTestId(TestId.QURAN_READER_CHAPTER_EVENT);
      await expect(chapterEvent).not.toBeVisible();
    },
  );
});
