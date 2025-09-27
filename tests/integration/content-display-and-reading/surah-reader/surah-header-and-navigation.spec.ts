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
    { tag: ['@fast', '@surah', '@header'] },
    async ({ page }) => {
      // Verify the chapter title is displayed
      await expect(page.getByTestId('chapter-title')).toBeVisible();

      // The surah name in arabic calligraphy (it uses a special font)
      await expect(page.getByTestId('chapter-title')).toContainText(chapter.surahCaligraphy);

      // The surah name transliteration
      await expect(page.getByTestId('chapter-title')).toContainText(chapter.transliteratedName);

      // The surah name translation
      await expect(page.getByTestId('chapter-title')).toContainText(chapter.translatedName);
    },
  );

  test(
    'Opening a surah displays its first verse automatically',
    { tag: ['@fast', '@surah', '@verses'] },
    async ({ page }) => {
      // Verify the first verse is visible
      await expect(page.getByTestId('verse-1:1')).toBeVisible();
    },
  );
});

test.describe('Surah Navigation', () => {
  test(
    'Surah info button navigates to surah information page',
    { tag: ['@slow', '@surah', '@navigation'] },
    async ({ page }) => {
      // Click on the info icon
      await page.getByLabel('Surah Info').click();

      // Make sure we are navigated to the surah info page
      await expect(page).toHaveURL('/surah/1/info');
    },
  );
});
