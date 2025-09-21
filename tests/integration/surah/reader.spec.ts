import { test, expect } from '@playwright/test';

import { chapter } from '@/tests/mocks/chapters';

test.beforeEach(async ({ page }) => {
  await page.goto('/1', { waitUntil: 'networkidle' });
});

test.describe('Surah Reader', () => {
  test('surah calligraphy, transliteration and translation are displayed', async ({ page }) => {
    // Verify the chapter title is displayed
    await expect(page.getByTestId('chapter-title')).toBeVisible();

    // The surah name in arabic calligraphy (it uses a special font)
    await expect(page.getByTestId('chapter-title')).toContainText(chapter.surahCaligraphy);

    // The surah name transliteration
    await expect(page.getByTestId('chapter-title')).toContainText(chapter.transliteratedName);

    // The surah name translation
    await expect(page.getByTestId('chapter-title')).toContainText(chapter.translatedName);
  });

  test('opening a surah displays its first verse', async ({ page }) => {
    // Verify the first verse is visible
    await expect(page.getByTestId('verse-1:1')).toBeVisible();
  });

  test('clicking the info icon opens the surah info page', async ({ page }) => {
    // Click on the info icon
    await page.getByLabel('Surah Info').click();

    // Make sure we are navigated to the surah info page
    await expect(page).toHaveURL('/surah/1/info');
  });
});
