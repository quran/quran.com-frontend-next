import { test, expect } from '@playwright/test';

import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import Homepage from '@/tests/POM/home-page';
import { MushafLines, QuranFont } from '@/types/QuranReader';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
  await homepage.goTo();
});

test('Selecting a non-default theme should persist the selected font', async ({ page }) => {
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
});
