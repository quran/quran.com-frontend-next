import type { Locator, Page } from '@playwright/test';

import { TestId } from '@/tests/test-ids';

/**
 * Gets the test user password from environment variable
 * @returns {string} The test user password
 */
export const getTestUserPassword = (): string => {
  // Fallback password is for local development only.
  // In CI/CD or production environments, TEST_USER_PASSWORD must be set.
  return process.env.TEST_USER_PASSWORD || 'CurrentPass123!';
};

/**
 * Gets the change password section locator from the page
 * @param {Page} page - The Playwright page object
 * @returns {Locator} The change password section locator
 */
export const getChangePasswordSection = (page: Page): Locator => {
  return page.getByTestId(TestId.AUTH_UPDATE_PROFILE_CHANGE_PASSWORD_SECTION);
};

/**
 * Gets all form input locators from the change password section
 * @param {Locator} section - The change password section locator
 * @returns {object} Object containing all form input locators
 */
export const getFormInputs = (section: Locator) => {
  const currentPasswordInput = section.getByTestId(
    TestId.AUTH_UPDATE_PROFILE_CURRENT_PASSWORD_INPUT,
  );
  const newPasswordInput = section.getByTestId(TestId.AUTH_UPDATE_PROFILE_NEW_PASSWORD_INPUT);
  const confirmPasswordInput = section.getByTestId(
    TestId.AUTH_UPDATE_PROFILE_CONFIRM_NEW_PASSWORD_INPUT,
  );

  return {
    currentPassword: currentPasswordInput,
    newPassword: newPasswordInput,
    confirmPassword: confirmPasswordInput,
    currentPasswordToggle: currentPasswordInput
      .locator('..')
      .locator('button[aria-label*="password"]'),
    newPasswordToggle: newPasswordInput.locator('..').locator('button[aria-label*="password"]'),
    confirmPasswordToggle: confirmPasswordInput
      .locator('..')
      .locator('button[aria-label*="password"]'),
    updateButton: section.getByRole('button', { name: /update.*password/i }),
  };
};

/**
 * Gets the password validation section
 * @param {Locator} section - The change password section locator
 * @returns {Locator} The password validation section locator
 */
export const getPasswordValidation = (section: Locator): Locator => {
  return section.getByTestId(TestId.PASSWORD_VALIDATION);
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

/**
 * Mocks the password update API call for testing without side effects
 * @param {Page} page - The Playwright page object
 * @param {object} options - Mock response options
 * @param {boolean} options.success - Whether the API call should succeed
 * @param {string} options.errorMessage - Optional error message for failure cases
 * @returns {Promise<void>}
 */
export const mockPasswordUpdateApi = async (
  page: Page,
  options: { success: boolean; errorMessage?: string } = { success: true },
): Promise<void> => {
  await page.route('**/api/proxy/auth/users/updatePassword', async (route) => {
    if (options.success) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password updated successfully',
        }),
      });
    } else {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: options.errorMessage || 'Incorrect current password',
          error: {
            code: 'INVALID',
            message: options.errorMessage || 'Current password is invalid',
            details: {
              currentPassword: 'INVALID',
            },
          },
        }),
      });
    }
  });
};
