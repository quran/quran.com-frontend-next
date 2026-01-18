import { expect, type Page } from '@playwright/test';

const switchToMode = async (
  page: Page,
  mode: 'translation' | 'reading',
  verseKey: string = '1:1',
) => {
  // Sometimes on mobile, the tab is not visible, so we need to scroll down and up to make it visible
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));

  const tabTestId = `${mode}-tab`;
  const buttonTestId = `${mode}-button`;

  const tab = page.getByTestId(tabTestId);
  const button = page.getByTestId(buttonTestId);

  // Try clicking the tab first (desktop view), fallback to button (mobile view)
  if (await tab.isVisible()) {
    await tab.click();
  } else if (await button.isVisible()) {
    await button.click();
  } else {
    throw new Error(`Neither ${tabTestId} nor ${buttonTestId} is visible`);
  }

  await page.waitForTimeout(200); // Wait for the page to be fully loaded

  // Verify the mode switch was successful by checking that the verse is visible
  await expect(page.getByTestId(`verse-arabic-${verseKey}`)).toBeVisible();
};

/**
 * Switches the page to translation mode by clicking the translation tab or button.
 * Handles mobile environments where tabs may require scrolling to become visible,
 * and falls back to button clicks if tabs are not available.
 * @param {Page} page - The Playwright page instance
 * @param {string} [verseKey] - Optional verse key to verify visibility after switching (defaults to '1:1')
 * @returns {Promise<void>} Promise that resolves when translation mode is active and the verse is visible
 */
export const switchToTranslationMode = (page: Page, verseKey?: string) =>
  switchToMode(page, 'translation', verseKey);

/**
 * Switches the page to reading mode by clicking the reading tab or button.
 * Handles mobile environments where tabs may require scrolling to become visible,
 * and falls back to button clicks if tabs are not available.
 * @param {Page} page - The Playwright page instance
 * @param {string} [verseKey] - Optional verse key to verify visibility after switching (defaults to '1:1')
 * @returns {Promise<void>} Promise that resolves when reading mode is active and the verse is visible
 */
export const switchToReadingMode = (page: Page, verseKey?: string) =>
  switchToMode(page, 'reading', verseKey);
