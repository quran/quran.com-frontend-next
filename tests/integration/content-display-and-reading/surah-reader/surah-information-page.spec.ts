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
      const modalContent = page.getByTestId('fake-modal-content');

      // Verify modal is open and contains surah info content
      await expect(modalContent).toBeVisible();

      // Verify the surah name transliteration is displayed
      const surahName = modalContent.getByTestId('surah-name');
      await expect(surahName).toBeVisible();
      await expect(surahName).toContainText(new RegExp(`${chapter.transliteratedName}$`));

      // Verify the surah revelation place is correct
      const revelationPlace = modalContent.getByTestId('surah-revelation-place');
      await expect(revelationPlace).toBeVisible();
      await expect(revelationPlace).toHaveText('Mecca');

      // Verify the surah number of ayahs is correct
      const numberOfAyahs = modalContent.getByTestId('surah-number-of-ayahs');
      await expect(numberOfAyahs).toBeVisible();
      await expect(numberOfAyahs).toContainText(chapter.versesCount.toString());
    },
  );
});
