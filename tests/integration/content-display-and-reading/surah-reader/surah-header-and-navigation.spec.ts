import { test, expect } from '@playwright/test';

import { chapter } from '@/tests/mocks/chapters';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1');
});

test.describe('Surah Header Display', () => {
  test(
    'Surah header displays calligraphy, transliteration and translation',
    { tag: ['@fast', '@surah', '@header', '@smoke'] },
    async ({ page }) => {
      // Pre-calcul of the chapter title locator
      const chapterTitle = page.getByTestId('chapter-title');
      // Verify the chapter title is displayed
      await expect(chapterTitle).toBeVisible();

      // The surah name in arabic calligraphy (it uses a special font)
      await expect(chapterTitle).toContainText(chapter.id.toString().padStart(3, '0'));

      // The surah name transliteration
      await expect(chapterTitle).toContainText(chapter.transliteratedName);

      // The surah name translation
      await expect(chapterTitle).toContainText(chapter.translatedName);
    },
  );

  test(
    'Opening a surah displays its first verse automatically',
    { tag: ['@fast', '@surah', '@verses'] },
    async ({ page }) => {
      // Get the first verse (1:1)
      const firstVerse = page.getByTestId('verse-1:1');
      // Verify the first verse is visible
      await expect(firstVerse).toBeVisible();
    },
  );
});

test.describe('Surah Navigation', () => {
  test(
    'Surah info button navigates to surah information page',
    { tag: ['@slow', '@surah', '@navigation'] },
    async ({ page }) => {
      // Pre-calcul of the surah info button locator
      const infoButton = page.getByLabel('Surah Info');
      // Click on the info icon
      await infoButton.click();

      // Make sure we are navigated to the surah info page
      await expect(page).toHaveURL('/surah/1/info');
    },
  );
});
