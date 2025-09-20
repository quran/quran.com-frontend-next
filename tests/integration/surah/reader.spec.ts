import { test, expect } from '@playwright/test';

test.describe('Surah Reader', () => {
  test('opening a surah displays its first verse', async ({ page }) => {
    // Navigate to Al-Fatihah (Surah 1)
    await page.goto('/1', { waitUntil: 'networkidle' });

    // Verify the chapter title is displayed
    await expect(page.getByTestId('chapter-title')).toContainText('Al-Fatihah');

    // Verify the first verse is visible
    await expect(page.getByTestId('verse-1:1')).toBeVisible();
  });

  test('verse arabic is displayed', async ({ page }) => {
    await page.goto('/1', { waitUntil: 'networkidle' });

    // Verify the first verse contains Arabic text
    const firstVerse = page.getByTestId('verse-1:1');
    await expect(firstVerse).toContainText('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ');
  });

  test('verse translation is displayed', async ({ page }) => {
    await page.goto('/1', { waitUntil: 'networkidle' });

    // Verify the first verse translation is visible
    const firstVerse = page.getByTestId('verse-1:1');
    await expect(firstVerse).toContainText(
      'In the Name of Allah—the Most Compassionate, Most Merciful.',
    );
  });
});
