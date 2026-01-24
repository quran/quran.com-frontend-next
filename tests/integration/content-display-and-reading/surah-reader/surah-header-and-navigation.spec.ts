import { test, expect } from '@playwright/test';

import { chapter } from '@/tests/mocks/chapters';
import Homepage from '@/tests/POM/home-page';
import { getVerseTestId, TestId } from '@/tests/test-ids';

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
      const chapterTitle = page.getByTestId(TestId.CHAPTER_TITLE);
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
      const firstVerse = page.getByTestId(getVerseTestId('1:1'));
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
      // Locate the surah info button
      const infoButton = page.getByTestId(TestId.SURAH_INFO_BUTTON);

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
      // Pre-calculate the surah info button locator
      const infoButton = page.getByTestId(TestId.SURAH_INFO_BUTTON);

      // Click on the info button
      await infoButton.click();

      // Verify modal is open and contains surah info content
      await expect(page.getByTestId(TestId.MODAL_CONTENT)).toBeVisible();
      await expect(page.getByText('Surah Info')).toBeVisible(); // Modal header

      // Verify surah info content is inside the modal
      const modalContent = page.getByTestId(TestId.MODAL_CONTENT);
      await expect(modalContent.getByTestId(TestId.SURAH_NAME)).toBeVisible();
      await expect(modalContent.getByTestId(TestId.SURAH_NAME)).toContainText('Surah Al-Fatihah');
      await expect(modalContent.getByTestId(TestId.SURAH_REVELATION_PLACE)).toContainText('Mecca');
      await expect(modalContent.getByTestId(TestId.SURAH_NUMBER_OF_AYAHS)).toContainText('7');
    },
  );
});
