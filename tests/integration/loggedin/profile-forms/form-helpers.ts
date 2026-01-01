import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Fills an input field with a value and triggers blur event
 * @param {Locator} input - The Playwright locator for the input field
 * @param {string} value - The value to fill into the input
 * @returns {Promise<void>}
 */
export const fillAndBlur = async (input: Locator, value: string): Promise<void> => {
  await input.clear();
  await input.fill(value);
  await input.blur();
};

/**
 * Enables form validation by clicking the save button
 * @param {Page} page - The Playwright page object
 * @param {Locator} saveButton - The save button locator
 * @returns {Promise<void>}
 */
export const enableValidation = async (page: Page, saveButton: Locator): Promise<void> => {
  await saveButton.click();
  await page.waitForTimeout(500);
};

/**
 * Asserts that no error message is visible in the form section
 * @param {Locator} section - The form section locator
 * @param {number} [timeout=1000] - Maximum time to wait in milliseconds
 * @returns {Promise<void>}
 */
export const expectNoError = async (section: Locator, timeout = 1000): Promise<void> => {
  const errorMessage = section.getByText(/missing|invalid/i);
  await expect(errorMessage).not.toBeVisible({ timeout });
};

/**
 * Asserts that an error message matching the pattern is visible in the form section
 * @param {Locator} section - The form section locator
 * @param {RegExp} pattern - Regular expression pattern to match the error message
 * @param {number} [timeout=3000] - Maximum time to wait in milliseconds
 * @returns {Promise<void>}
 */
export const expectError = async (
  section: Locator,
  pattern: RegExp,
  timeout = 3000,
): Promise<void> => {
  const errorMessage = section.getByText(pattern);
  await expect(errorMessage).toBeVisible({ timeout });
};

/**
 * Asserts that an error message matching the pattern is visible in a toast notification
 * @param {Page} page - The Playwright page object
 * @param {RegExp} pattern - Regular expression pattern to match the error message
 * @param {number} [timeout=3000] - Maximum time to wait in milliseconds
 * @returns {Promise<void>}
 */
export const expectToastError = async (
  page: Page,
  pattern: RegExp,
  timeout = 3000,
): Promise<void> => {
  const toast = page.getByRole('alert').filter({ hasText: pattern });
  await expect(toast).toBeVisible({ timeout });
};
