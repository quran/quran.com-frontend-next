/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import Homepage from '@/tests/POM/home-page';
import { MushafLines, QuranFont } from '@/types/QuranReader';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
  await homepage.goTo('/112');
});

test.describe('Font and Mushaf Settings', () => {
  test(
    'Font and Mushaf line selection persists across page reloads',
    { tag: ['@fast', '@settings', '@fonts'] },
    async ({ page }) => {
      // 1. make sure code v1 and 16-line Mushaf are persisted by default
      let persistedQuranReaderStyles = (await homepage.getPersistedValue(
        'quranReaderStyles',
      )) as QuranReaderStyles;
      expect(persistedQuranReaderStyles.quranFont).toBe(QuranFont.MadaniV1);
      expect(persistedQuranReaderStyles.mushafLines).toBe(MushafLines.SixteenLines);
      // 2. Open the settings drawer
      await homepage.openSettingsDrawer();
      // 3. Choose Indopak font
      await page.getByTestId('text_indopak-button').click();
      // 4. Choose Indopak 15-line Mushaf
      await expect(page.getByTestId('lines')).toBeVisible();
      await page.getByTestId('lines').selectOption(MushafLines.FifteenLines);
      // 5. make sure indopak and 15-line Mushaf are persisted
      persistedQuranReaderStyles = (await homepage.getPersistedValue(
        'quranReaderStyles',
      )) as QuranReaderStyles;
      expect(persistedQuranReaderStyles.quranFont).toBe(QuranFont.IndoPak);
      expect(persistedQuranReaderStyles.mushafLines).toBe(MushafLines.FifteenLines);

      // 6. reload the page.
      await homepage.reload();

      // 7. Open the settings drawer
      await homepage.openSettingsDrawer();
      // 8. Make sure the selected font is 15 lines that was hydrated from Redux
      expect(await page.getByTestId('lines').inputValue()).toBe(MushafLines.FifteenLines);
    },
  );

  test(
    'Changing font updates the font in the reader',
    { tag: ['@settings', '@fonts', '@reader'] },
    async ({ page }) => {
      // Open the settings drawer
      await homepage.openSettingsDrawer();
      // Choose Indopak font
      await page.getByTestId('text_indopak-button').click();
      // Make sure the font in the reader is updated
      const firstWord = page.locator('[data-word-location="112:1:1"]').first();
      // Get the deepest nested span element which contains the actual font styling
      const lastSpan = firstWord.locator('span').last();
      await expect(lastSpan).toHaveClass(/IndoPak/);
    },
  );

  test(
    'Tajweed font works correctly',
    { tag: ['@settings', '@fonts', '@reader'] },
    async ({ page }) => {
      // Open the settings drawer
      await homepage.openSettingsDrawer();
      // Choose Tajweed font
      await page.getByTestId('tajweed-button').click();
      // Make sure the font in the reader is updated
      const firstWord = page.locator('[data-word-location="112:1:1"]').first();
      // Get the deepest nested span element which contains the actual font styling
      const lastSpan = firstWord.locator('span').last();
      await expect(lastSpan).toHaveClass(/GlyphWord/); // Check that it contains the GlyphWord class
      await expect(lastSpan).toHaveCSS('font-family', /p604/); // Check that the font-family is correct
    },
  );
});
