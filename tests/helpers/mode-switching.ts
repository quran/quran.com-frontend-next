import { expect, type Page } from '@playwright/test';

const switchToMode = async (
  page: Page,
  mode: 'translation' | 'reading',
  verseKey: string = '1:1',
) => {
  await Promise.race([
    page.getByTestId(`${mode}-button`).click(),
    page.getByTestId(`${mode}-tab`).click(),
  ]);

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
