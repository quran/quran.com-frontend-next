import type { Locator, Page } from '@playwright/test';

import { TestId } from '@/tests/test-ids';

/**
 * Gets the email notification settings section locator from the page
 * @param {Page} page - The Playwright page object
 * @returns {Locator} The email notification settings section locator
 */
export const getEmailNotificationSettingsSection = (page: Page): Locator => {
  return page.getByTestId(TestId.AUTH_UPDATE_PROFILE_EMAIL_NOTIFICATION_SETTINGS_SECTION);
};

/**
 * Gets the save button from the email notification settings section
 * @param {Locator} section - The email notification settings section locator
 * @returns {Locator} The save button locator
 */
export const getSaveButton = (section: Locator): Locator => {
  return section.getByRole('button', { name: 'Save Changes' });
};

/**
 * Gets all checkboxes from the email notification settings section
 * @param {Locator} section - The email notification settings section locator
 * @returns {Promise<Locator[]>} Array of checkbox locators
 */
export const getAllCheckboxes = async (section: Locator): Promise<Locator[]> => {
  const checkboxes = section.getByTestId(
    TestId.AUTH_UPDATE_PROFILE_EMAIL_NOTIFICATION_SETTINGS_CHECKBOX,
  );
  const count = await checkboxes.count();
  const locators: Locator[] = [];

  for (let i = 0; i < count; i += 1) {
    locators.push(checkboxes.nth(i));
  }

  return locators;
};

/**
 * Gets a specific checkbox by its index
 * @param {Locator} section - The email notification settings section locator
 * @param {number} index - The index of the checkbox (0-based)
 * @returns {Locator} The checkbox locator
 */
export const getCheckboxByIndex = (section: Locator, index: number): Locator => {
  return section
    .getByTestId(TestId.AUTH_UPDATE_PROFILE_EMAIL_NOTIFICATION_SETTINGS_CHECKBOX)
    .nth(index);
};

/**
 * Gets the current checked state of all checkboxes
 * @param {Locator} section - The email notification settings section locator
 * @returns {Promise<boolean[]>} Array of checked states
 */
export const getCheckboxStates = async (section: Locator): Promise<boolean[]> => {
  const checkboxes = await getAllCheckboxes(section);
  const states: boolean[] = [];

  const results = await Promise.all(checkboxes.map((checkbox) => checkbox.isChecked()));
  states.push(...results);

  return states;
};
