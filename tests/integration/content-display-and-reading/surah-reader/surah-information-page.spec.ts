import { test, expect } from '@playwright/test';

import { chapter } from '@/tests/mocks/chapters';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/surah/1/info');
});

test.describe('Surah Information Page', () => {
  test(
    'Surah information displays transliteration, revelation place, and verse count in modal',
    { tag: ['@fast', '@surah', '@info', '@smoke'] },
    async ({ page }) => {
      // Verify modal is open and contains surah info content
      await expect(page.getByTestId(TestId.MODAL_CONTENT)).toBeVisible();
      await expect(page.getByText('Surah Info')).toBeVisible(); // Modal header

      // Verify surah info content is inside the modal
      const modalContent = page.getByTestId(TestId.MODAL_CONTENT);
      await expect(modalContent.getByTestId(TestId.SURAH_NAME)).toBeVisible();

      // Verify the surah name transliteration is displayed
      await expect(modalContent.getByTestId(TestId.SURAH_NAME)).toContainText(
        `Surah ${chapter.transliteratedName}`,
      );

      // Verify the surah revelation place is displayed
      await expect(modalContent.getByTestId(TestId.SURAH_REVELATION_PLACE)).toBeVisible();

      // Verify the surah revelation place is Meccan
      await expect(modalContent.getByTestId(TestId.SURAH_REVELATION_PLACE)).toHaveText('Mecca');

      // Verify the surah number of ayahs is displayed
      await expect(modalContent.getByTestId(TestId.SURAH_NUMBER_OF_AYAHS)).toBeVisible();

      // Verify the surah number of ayahs is 7
      await expect(modalContent.getByTestId(TestId.SURAH_NUMBER_OF_AYAHS)).toContainText(
        chapter.versesCount.toString(),
      );
    },
  );
});
