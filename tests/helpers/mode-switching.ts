import type { Page } from '@playwright/test';

/**
 * Switch to translation mode with extra logic to handle mobile environments
 * where the tab might not be visible initially.
 */
export const switchToTranslationMode = async (page: Page) => {
  // Sometime on mobile, the tab is not visible, so we need to scroll down and up to make it visible
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));

  const translationTab = page.getByTestId('translation-tab');
  const translationButton = page.getByTestId('translation-button');

  await Promise.race([translationTab.click(), translationButton.click()]);

  await page.waitForTimeout(200); // Wait for the page to be fully loaded
};

/**
 * Switch to reading mode with extra logic to handle mobile environments
 * where the tab might not be visible initially.
 */
export const switchToReadingMode = async (page: Page) => {
  // Sometime on mobile, the tab is not visible, so we need to scroll down and up to make it visible
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));

  const readingTab = page.getByTestId('reading-tab');
  const readingButton = page.getByTestId('reading-button');

  await Promise.race([readingTab.click(), readingButton.click()]);

  await page.waitForTimeout(200); // Wait for the page to be fully loaded
};
