import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { getVerseArabicTestId, TestId } from '@/tests/test-ids';

/**
 * Switch to translation mode with extra logic to handle mobile environments
 * where the tab might not be visible initially.
 */
export const switchToTranslationMode = async (page: Page, verseKey: string = '1:1') => {
  // Sometime on mobile, the tab is not visible, so we need to scroll down and up to make it visible
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.waitForTimeout(50);
  await page.evaluate(() => window.scrollTo(0, 0));

  const translationTab = page.getByTestId(TestId.TRANSLATION_TAB);
  const translationButton = page.getByTestId(TestId.TRANSLATION_BUTTON);
  await Promise.race([translationTab.click(), translationButton.click()]);

  const verse = page.getByTestId(getVerseArabicTestId(verseKey));
  await expect(verse).toBeVisible();
};

/**
 * Switch to reading mode with extra logic to handle mobile environments
 * where the tab might not be visible initially.
 */
export const switchToReadingMode = async (page: Page, verseKey: string = '1:1') => {
  // Sometime on mobile, the tab is not visible, so we need to scroll down and up to make it visible
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.waitForTimeout(50);
  await page.evaluate(() => window.scrollTo(0, 0));

  const readingTab = page.getByTestId(TestId.READING_TAB);
  const readingButton = page.getByTestId(TestId.READING_BUTTON);

  await Promise.race([readingTab.click(), readingButton.click()]);

  const verse = page.getByTestId(getVerseArabicTestId(verseKey));
  await expect(verse).toBeVisible();
};
