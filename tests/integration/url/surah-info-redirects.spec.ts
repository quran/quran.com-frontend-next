import { test, expect, Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

/**
 * Helper function to verify that the modal contains the expected surah information
 */
const verifyModalContainsSurahInfo = async (
  page: Page,
  expectedSurahName: string,
  expectedRevelationPlace: string,
  expectedAyahs: string,
) => {
  const modalContent = page.getByTestId(TestId.MODAL_CONTENT);

  // Verify modal is open and contains surah info content
  await expect(modalContent).toBeVisible();

  const surahName = modalContent.getByTestId(TestId.SURAH_NAME);

  // Verify surah info content is inside the modal
  await expect(surahName).toBeVisible();
  await expect(surahName).toContainText(expectedSurahName);

  // Verify the surah revelation place is correct
  const revelationPlace = modalContent.getByTestId(TestId.SURAH_REVELATION_PLACE);
  await expect(revelationPlace).toBeVisible();
  await expect(revelationPlace).toContainText(expectedRevelationPlace);

  // Verify the surah number of ayahs is correct
  const numberOfAyahs = modalContent.getByTestId(TestId.SURAH_NUMBER_OF_AYAHS);
  await expect(numberOfAyahs).toBeVisible();
  await expect(numberOfAyahs).toContainText(expectedAyahs);
};

test.beforeEach(async ({ page, context }) => {
  test.slow();

  homePage = new Homepage(page, context);
});

test.describe('Surah Info URL Redirects', () => {
  test(
    'should redirect /surah-info/1 to /surah/1/info and display surah info modal',
    { tag: ['@url', '@redirect', '@surah-info', '@smoke'] },
    async ({ page }) => {
      // Navigate to the old URL
      await homePage.goTo('/surah-info/1');

      // Should be redirected to the new URL
      await expect(page).toHaveURL('/surah/1/info');

      // Verify modal contains surah info
      await verifyModalContainsSurahInfo(page, 'Surah Al-Fatihah', 'Mecca', '7');
    },
  );

  test(
    'should redirect /surah-info/al-fatihah to /surah/al-fatihah/info and display surah info modal',
    { tag: ['@url', '@redirect', '@surah-info'] },
    async ({ page }) => {
      // Navigate to the old URL with slug
      await homePage.goTo('/surah-info/al-fatihah');

      // Should be redirected to the new URL
      await expect(page).toHaveURL('/surah/al-fatihah/info');

      // Verify modal contains surah info
      await verifyModalContainsSurahInfo(page, 'Surah Al-Fatihah', 'Mecca', '7');
    },
  );

  test(
    'should redirect /chapter_info/1 to /surah/1/info and display surah info modal',
    { tag: ['@url', '@redirect', '@chapter-info', '@smoke'] },
    async ({ page }) => {
      // Navigate to the old URL
      await homePage.goTo('/chapter_info/1');

      // Should be redirected to the new URL
      await expect(page).toHaveURL('/surah/1/info');

      // Verify modal contains surah info
      await verifyModalContainsSurahInfo(page, 'Surah Al-Fatihah', 'Mecca', '7');
    },
  );

  test(
    'should redirect /chapter_info/al-fatihah to /surah/al-fatihah/info and display surah info modal',
    { tag: ['@url', '@redirect', '@chapter-info'] },
    async ({ page }) => {
      // Navigate to the old URL with slug
      await homePage.goTo('/chapter_info/al-fatihah');

      // Should be redirected to the new URL
      await expect(page).toHaveURL('/surah/al-fatihah/info');

      // Verify modal contains surah info
      await verifyModalContainsSurahInfo(page, 'Surah Al-Fatihah', 'Mecca', '7');
    },
  );

  test(
    'should redirect /surah-info/2 to /surah/2/info and display Al-Baqarah info',
    { tag: ['@url', '@redirect', '@surah-info'] },
    async ({ page }) => {
      // Navigate to the old URL
      await homePage.goTo('/surah-info/2');

      // Should be redirected to the new URL
      await expect(page).toHaveURL('/surah/2/info');

      // Verify modal contains surah info
      await verifyModalContainsSurahInfo(page, 'Surah Al-Baqarah', 'Medina', '286');
    },
  );

  test(
    'should redirect /surah-info/al-baqarah to /surah/al-baqarah/info and display Al-Baqarah info',
    { tag: ['@url', '@redirect', '@surah-info'] },
    async ({ page }) => {
      // Navigate to the old URL with slug
      await homePage.goTo('/surah-info/al-baqarah');

      // Should be redirected to the new URL
      await expect(page).toHaveURL('/surah/al-baqarah/info');

      // Verify modal contains surah info
      await verifyModalContainsSurahInfo(page, 'Surah Al-Baqarah', 'Medina', '286');
    },
  );

  test(
    'should redirect /chapter_info/2 to /surah/2/info and display Al-Baqarah info',
    { tag: ['@url', '@redirect', '@chapter-info'] },
    async ({ page }) => {
      // Navigate to the old URL
      await homePage.goTo('/chapter_info/2');

      // Should be redirected to the new URL
      await expect(page).toHaveURL('/surah/2/info');

      // Verify modal contains surah info
      await verifyModalContainsSurahInfo(page, 'Surah Al-Baqarah', 'Medina', '286');
    },
  );

  test(
    'should redirect /chapter_info/al-baqarah to /surah/al-baqarah/info and display Al-Baqarah info',
    { tag: ['@url', '@redirect', '@chapter-info'] },
    async ({ page }) => {
      // Navigate to the old URL with slug
      await homePage.goTo('/chapter_info/al-baqarah');

      // Should be redirected to the new URL
      await expect(page).toHaveURL('/surah/al-baqarah/info');

      // Verify modal contains surah info
      await verifyModalContainsSurahInfo(page, 'Surah Al-Baqarah', 'Medina', '286');
    },
  );

  test(
    'should handle invalid surah identifier gracefully',
    { tag: ['@url', '@redirect', '@error'] },
    async ({ page }) => {
      // Navigate to an invalid surah identifier
      await homePage.goTo('/surah-info/invalid-surah');

      // Should redirect to the new URL
      await expect(page).toHaveURL('/surah/invalid-surah/info');

      // The page should handle invalid surah gracefully
      // This depends on how the app handles invalid chapter IDs
      // For now, we'll just verify the redirect happened
    },
  );

  test(
    'should handle redirect with complex slug patterns',
    { tag: ['@url', '@redirect', '@surah-info'] },
    async ({ page }) => {
      // Test with a surah that has a more complex slug
      await homePage.goTo('/surah-info/al-alaq');

      // Should be redirected to the new URL
      await expect(page).toHaveURL('/surah/al-alaq/info');

      // Verify the info loads for Al-Alaq (Surah 96) inside the modal
      await verifyModalContainsSurahInfo(page, "Surah Al-'Alaq", 'Mecca', '19');
    },
  );
});
