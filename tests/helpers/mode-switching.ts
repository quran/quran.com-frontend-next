import type { Page } from '@playwright/test';

import { getVerseArabicTestId, getVerseTestId, TestId } from '@/tests/test-ids';

/**
 * Switch to translation mode with extra logic to handle mobile environments
 * where the tab might not be visible initially.
 */
export const switchToTranslationMode = async (page: Page, verseKey: string = '1:1') => {
  // Sometime on mobile, the tab is not visible, so we need to scroll down and up to make it visible
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));

  const translationTab = page.getByTestId(TestId.TRANSLATION_TAB);
  const translationButton = page.getByTestId(TestId.TRANSLATION_BUTTON);
  const verse = page.getByTestId(getVerseTestId(verseKey));

  await Promise.race([
    translationTab.click(),
    translationButton.click(),
    verse.waitFor({ state: 'visible' }),
  ]);

  await page.waitForTimeout(200); // Wait for the page to be fully loaded
};

/**
 * Switch to reading mode with extra logic to handle mobile environments
 * where the tab might not be visible initially.
 */
export const switchToReadingMode = async (page: Page, verseKey: string = '1:1') => {
  // Sometime on mobile, the tab is not visible, so we need to scroll down and up to make it visible
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));

  const readingTab = page.getByTestId(TestId.READING_TAB);
  const readingButton = page.getByTestId(TestId.READING_BUTTON);
  const verse = page.getByTestId(getVerseArabicTestId(verseKey));

  await Promise.race([
    readingTab.click(),
    readingButton.click(),
    verse.waitFor({ state: 'visible' }),
  ]);

  await page.waitForTimeout(200); // Wait for the page to be fully loaded
};
