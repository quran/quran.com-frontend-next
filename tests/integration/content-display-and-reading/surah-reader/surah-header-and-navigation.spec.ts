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

// eslint-disable-next-line react-func/max-lines-per-function
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
      // Open the surah info modal
      const infoButton = page.getByTestId(TestId.SURAH_INFO_BUTTON);
      await infoButton.click();

      // Get the modal content
      const modalContent = page.getByTestId(TestId.MODAL_CONTENT);
      await expect(modalContent).toBeVisible();

      // Verify the modal header is visible
      const modalHeader = page.getByText('Surah Info');
      await expect(modalHeader).toBeVisible();

      // Verify the surah name is visible
      const surahName = modalContent.getByTestId(TestId.SURAH_NAME);
      await expect(surahName).toBeVisible();
      await expect(surahName).toContainText(`Surah ${chapter.transliteratedName}`);

      // Verify the revelation place is visible
      const revelationPlace = modalContent.getByTestId(TestId.SURAH_REVELATION_PLACE);
      await expect(revelationPlace).toBeVisible();
      await expect(revelationPlace).toContainText('Mecca');

      // Verify the number of ayahs is visible
      const numberOfAyahs = modalContent.getByTestId(TestId.SURAH_NUMBER_OF_AYAHS);
      await expect(numberOfAyahs).toBeVisible();
      await expect(numberOfAyahs).toContainText(chapter.versesCount.toString());

      // Verify the surah info header is sticky while scrolling
      const dialogContent = page.getByTestId(TestId.ROOT_DIALOG);
      const surahInfoContent = page.getByTestId(TestId.SURAH_INFO_CONTENT);

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
