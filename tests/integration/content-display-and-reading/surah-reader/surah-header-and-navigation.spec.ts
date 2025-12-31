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

// eslint-disable-next-line react-func/max-lines-per-function
test.describe('Surah Navigation', () => {
  test(
    'Surah info button navigates to surah information page',
    { tag: ['@slow', '@surah', '@navigation'] },
    async ({ page }) => {
      // Locate the surah info button
      const infoButton = page.getByTestId('surah-info-button');

      // Click on the info button
      await infoButton.click();

      // Make sure URL is updated to /surah/1/info
      await expect(page).toHaveURL('/surah/1/info');
    },
  );

  test(
    'Clicking surah info button opens modal with surah information',
    { tag: ['@slow', '@surah', '@modal', '@info'] },
    async ({ page }) => {
      const infoButton = page.getByTestId('surah-info-button');
      await infoButton.click();

      // Verify modal is open and contains surah info content
      await expect(page.getByTestId('modal-content')).toBeVisible();
      const modalHeader = page.getByText('Surah Info');
      await expect(modalHeader).toBeVisible(); // Modal header

      // Verify surah info content is inside the modal
      const modalContent = page.getByTestId('modal-content');
      await expect(modalContent.getByTestId('surah-name')).toBeVisible();
      await expect(modalContent.getByTestId('surah-name')).toContainText('Surah Al-Fatihah');
      await expect(modalContent.getByTestId('surah-revelation-place')).toContainText('Mecca');
      await expect(modalContent.getByTestId('surah-number-of-ayahs')).toContainText('7');

      // Verify sticky header behavior while scrolling
      const dialogContent = page.getByTestId('dialog-content');
      const surahInfoContent = page.getByTestId('surah-info-content');

      // Find which element is scrollable and scroll it
      const dialogScrollable = await dialogContent.evaluate(
        (el) => el.scrollHeight > el.clientHeight,
      );
      const scrollableElement = dialogScrollable ? dialogContent : surahInfoContent;

      await scrollableElement.evaluate((el) => {
        // eslint-disable-next-line no-param-reassign
        el.scrollTop = el.scrollHeight;
      });

      await expect(modalHeader).toBeVisible();
    },
  );
});
