import type { Locator, Page } from '@playwright/test';

import TEST_IDS from '@/utils/test-ids';

/**
 * Gets the test user password from environment variable
 * @returns {string} The test user password
 */
export const getTestUserPassword = (): string => {
  return process.env.TEST_USER_PASSWORD || 'CurrentPass123!';
};

/**
 * Gets the change password section locator from the page
 * @param {Page} page - The Playwright page object
 * @returns {Locator} The change password section locator
 */
export const getChangePasswordSection = (page: Page): Locator => {
  return page.getByTestId(TEST_IDS.AUTH.UPDATE_PROFILE.CHANGE_PASSWORD_SECTION);
};

/**
 * Gets all form input locators from the change password section
 * @param {Locator} section - The change password section locator
 * @returns {object} Object containing all form input locators
 */
export const getFormInputs = (section: Locator) => ({
  currentPassword: section.locator('input[type="password"], input[type="text"]').first(),
  newPassword: section.locator('input[type="password"], input[type="text"]').nth(1),
  confirmPassword: section.locator('input[type="password"], input[type="text"]').nth(2),
  currentPasswordToggle: section
    .locator('button[aria-label*="password"]')
    .filter({ hasText: '' })
    .first(),
  newPasswordToggle: section
    .locator('button[aria-label*="password"]')
    .filter({ hasText: '' })
    .nth(1),
  confirmPasswordToggle: section
    .locator('button[aria-label*="password"]')
    .filter({ hasText: '' })
    .nth(2),
  updateButton: section.getByRole('button', { name: /update.*password/i }),
});

/**
 * Gets the password validation section
 * @param {Locator} section - The change password section locator
 * @returns {Locator} The password validation section locator
 */
export const getPasswordValidation = (section: Locator): Locator => {
  return section.getByTestId('password-validation');
};

/**
 * Fills all password fields with values
 * @param {object} inputs - Form inputs object from getFormInputs
 * @param {string} currentPassword - Current password value
 * @param {string} newPassword - New password value
 * @param {string} confirmPassword - Confirm password value
 * @returns {Promise<void>}
 */
export const fillPasswordFields = async (
  inputs: ReturnType<typeof getFormInputs>,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> => {
  await inputs.currentPassword.fill(currentPassword);
  await inputs.newPassword.fill(newPassword);
  await inputs.confirmPassword.fill(confirmPassword);
};
