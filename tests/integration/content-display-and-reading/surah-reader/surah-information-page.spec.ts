import { test, expect } from '@playwright/test';

import { chapter } from '@/tests/mocks/chapters';
import Homepage from '@/tests/POM/home-page';

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
      await expect(page.getByTestId('modal-content')).toBeVisible();
      await expect(page.getByText('Surah Info')).toBeVisible(); // Modal header

      // Verify surah info content is inside the modal
      const modalContent = page.getByTestId('modal-content');
      await expect(modalContent.getByTestId('surah-name')).toBeVisible();

      // Verify the surah name transliteration is displayed
      await expect(modalContent.getByTestId('surah-name')).toContainText(
        `Surah ${chapter.transliteratedName}`,
      );

      // Verify the surah revelation place is displayed
      await expect(modalContent.getByTestId('surah-revelation-place')).toBeVisible();

      // Verify the surah revelation place is Meccan
      await expect(modalContent.getByTestId('surah-revelation-place')).toHaveText('Mecca');

      // Verify the surah number of ayahs is displayed
      await expect(modalContent.getByTestId('surah-number-of-ayahs')).toBeVisible();

      // Verify the surah number of ayahs is 7
      await expect(modalContent.getByTestId('surah-number-of-ayahs')).toContainText(
        chapter.versesCount.toString(),
      );
    },
  );
});
