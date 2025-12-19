import type { Locator, Page } from '@playwright/test';

import TEST_IDS from '@/utils/test-ids';

/**
 * Gets the edit details section locator from the page
 * @param {Page} page - The Playwright page object
 * @returns {Locator} The edit details section locator
 */
export const getEditDetailsSection = (page: Page): Locator => {
  return page.getByTestId(TEST_IDS.AUTH.UPDATE_PROFILE.EDIT_DETAILS_SECTION);
};

/**
 * Gets all form input locators from the edit details section
 * @param {Locator} section - The edit details section locator
 * @returns {object} Object containing all form input locators
 */
export const getFormInputs = (section: Locator) => ({
  email: section.locator('input#email'),
  username: section.locator('input#username'),
  firstName: section.locator('input#firstName'),
  lastName: section.locator('input#lastName'),
  saveButton: section.getByRole('button', { name: 'Save Changes' }),
});
