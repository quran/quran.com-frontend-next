import { test, expect } from '@playwright/test';

import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import Homepage from '@/tests/POM/home-page';
import { MushafLines, QuranFont } from '@/types/QuranReader';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Selecting a non-default theme should persist the selected font', async ({
  page,
  context,
}) => {
  const homepage = new Homepage(page, context);
  // 1. make sure code v1 and 16-line Mushaf are persisted by default
  let persistedQuranReaderStyles = (await homepage.getPersistedValue(
    'quranReaderStyles',
  )) as QuranReaderStyles;
  expect(persistedQuranReaderStyles.quranFont).toBe(QuranFont.MadaniV1);
  expect(persistedQuranReaderStyles.mushafLines).toBe(MushafLines.SixteenLines);
  // 2. Open the settings drawer
  await homepage.openSettingsDrawer();
  // 3. Choose Indopak font
  await page.locator('text=IndoPak').click();
  // 4. Choose Indopak 15-line Mushaf
  await page.locator('select[name="lines"]').selectOption(MushafLines.FifteenLines);
  // 5. Make sure indopak and 15-line Mushaf are persisted
  persistedQuranReaderStyles = (await homepage.getPersistedValue(
    'quranReaderStyles',
  )) as QuranReaderStyles;
  expect(persistedQuranReaderStyles.quranFont).toBe(QuranFont.IndoPak);
  expect(persistedQuranReaderStyles.mushafLines).toBe(MushafLines.FifteenLines);
  // 6. Reload the page.
  await page.reload();
  // 7. Open the settings drawer
  await homepage.openSettingsDrawer();
  // 8. Make sure the selected font is 15 lines that was hydrated from Redux
  expect(await page.locator('select[name="lines"]').inputValue()).toBe(MushafLines.FifteenLines);
});
