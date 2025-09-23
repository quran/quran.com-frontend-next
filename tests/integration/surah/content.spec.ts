import { test, expect } from '@playwright/test';

import mockFootnoteKhattabSurah1Verse2 from '@/tests/mocks/footnotes';
import { mockTranslationKhattab } from '@/tests/mocks/translations';

test.beforeEach(async ({ page }) => {
  await page.goto('/1', { waitUntil: 'networkidle' });
});

test.describe('Surah Content - Text Display', () => {
  test('verse arabic is displayed', async ({ page }) => {
    // Verify the first verse contains Arabic text
    const firstVerse = page.getByTestId('verse-1:1');
    await expect(firstVerse).toContainText(mockTranslationKhattab().arabic);
  });

  test('verse translation is displayed', async ({ page }) => {
    // Verify the first verse translation is visible
    const firstVerse = page.getByTestId('verse-1:1');
    await expect(firstVerse).toContainText(mockTranslationKhattab().text);
  });
});

test.describe('Surah Content - Footnotes', () => {
  test('footnote can be opened', async ({ page }) => {
    // 1. Make sure the footnote content is not visible
    await expect(page.getByTestId('footnote-content')).not.toBeVisible();

    // 2. Make sure the footnote trigger is present in the second verse
    const secondVerse = page.getByTestId('verse-1:2');
    const footnoteTrigger = secondVerse.locator('sup').first();

    // 3. Make sure the footnote content is visible after clicking the trigger
    await footnoteTrigger.click();
    await expect(page.getByTestId('footnote-content')).toBeVisible();

    // 4. Make sure the footnote content is correct
    await expect(page.getByTestId('footnote-content')).toContainText(
      mockFootnoteKhattabSurah1Verse2().text,
    );

    // 5. Click the footnote trigger again to close the footnote
    await footnoteTrigger.click();

    // 6. Make sure the footnote content is not visible anymore
    await expect(page.getByTestId('footnote-content')).not.toBeVisible();
  });
});

test.describe('Surah Content - Verse Loading', () => {
  test('verses are displayed bit by bit', async ({ page }) => {
    // Verify the first verse is visible
    await expect(page.getByTestId('verse-1:7')).not.toBeVisible();

    // Scroll to the verse 5 to make sure it's in the viewport
    await page.getByTestId('verse-1:5').scrollIntoViewIfNeeded();

    // Verify the verse 7 is now visible
    await expect(page.getByTestId('verse-1:7')).toBeVisible();
  });

  test('all 7 verses of Al-Fatihah are displayed', async ({ page }) => {
    // Verify all 7 verses are present using Promise.all for parallel execution
    const verseChecks = Array.from({ length: 7 }, (unused, index) => {
      const verseNumber = index + 1;
      return page
        .getByTestId(`verse-1:${verseNumber}`)
        .scrollIntoViewIfNeeded()
        .then(() => expect(page.getByTestId(`verse-1:${verseNumber}`)).toBeVisible());
    });

    await Promise.all(verseChecks);
  });
});
