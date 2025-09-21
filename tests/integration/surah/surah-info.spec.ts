import { test, expect } from '@playwright/test';

import { chapter } from '@/tests/mocks/chapters';

test.beforeEach(async ({ page }) => {
  await page.goto('/surah/1/info', { waitUntil: 'networkidle' });
});

test.describe('Surah Info Page', () => {
  test('surah transliteration, revelation place, number of ayah is displayed', async ({ page }) => {
    // Verify the surah name is displayed
    await expect(page.getByTestId('surah-name')).toBeVisible();

    // Verify the surah name transliteration is displayed
    await expect(page.getByTestId('surah-name')).toHaveText(`Surah ${chapter.transliteratedName}`);

    // Verify the surah revelation place is displayed
    await expect(page.getByTestId('surah-revelation-place')).toBeVisible();

    // Verify the surah revelation place is Meccan
    await expect(page.getByTestId('surah-revelation-place')).toHaveText(chapter.revelationPlace);

    // Verify the surah number of ayahs is displayed
    await expect(page.getByTestId('surah-number-of-ayahs')).toBeVisible();

    // Verify the surah number of ayahs is 7
    await expect(page.getByTestId('surah-number-of-ayahs')).toHaveText(
      chapter.versesCount.toString(),
    );
  });
});
