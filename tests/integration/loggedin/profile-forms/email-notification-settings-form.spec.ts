/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { expect, test } from '@playwright/test';

import {
  getAllCheckboxes,
  getCheckboxStates,
  getEmailNotificationSettingsSection,
  getSaveButton,
} from './email-notification-settings-form-helpers';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/profile');
});

const isNovuConfigured = [
  process.env.NEXT_PUBLIC_NOVU_BACKEND_URL,
  process.env.NEXT_PUBLIC_NOVU_SOCKET_URL,
  process.env.NEXT_PUBLIC_NOVU_APP_ID,
].every((value) => typeof value === 'string' && value.trim().length > 0);

test.skip(!isNovuConfigured, 'Novu env vars are missing');

const TEST_TAGS = ['@slow', '@auth', '@profile', '@email-notification-settings'];

// Wait time constants
const CHECKBOX_TOGGLE_WAIT = 300;
const PAGE_RELOAD_WAIT = 1000;
const LOADING_STATE_WAIT = 2000;

test.describe('Form Display', () => {
  test(
    'should display email notification settings section',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEmailNotificationSettingsSection(page);

      await expect(section).toBeVisible();
      await expect(section.getByText('Email Notification Settings')).toBeVisible();
    },
  );

  test('should display notification checkboxes', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getEmailNotificationSettingsSection(page);
    const checkboxes = await getAllCheckboxes(section);

    expect(checkboxes.length).toBeGreaterThan(0);

    await Promise.all(checkboxes.map((checkbox) => expect(checkbox).toBeVisible()));
  });

  test('should display save button', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getEmailNotificationSettingsSection(page);
    const saveButton = getSaveButton(section);

    await expect(saveButton).toBeVisible();
  });
});

test.describe('Save Button State', () => {
  test(
    'should have save button disabled when no changes are made',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEmailNotificationSettingsSection(page);
      const saveButton = getSaveButton(section);

      await expect(saveButton).toBeDisabled();
    },
  );

  test(
    'should enable save button when a checkbox is toggled',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEmailNotificationSettingsSection(page);
      const saveButton = getSaveButton(section);
      const checkboxes = await getAllCheckboxes(section);

      await expect(saveButton).toBeDisabled();

      if (checkboxes.length > 0) {
        await checkboxes[0].click();
        await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);

        await expect(saveButton).toBeEnabled();
      }
    },
  );

  test(
    'should disable save button again when changes are reverted',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEmailNotificationSettingsSection(page);
      const saveButton = getSaveButton(section);
      const checkboxes = await getAllCheckboxes(section);

      await expect(saveButton).toBeDisabled();

      if (checkboxes.length > 0) {
        await checkboxes[0].click();
        await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);
        await expect(saveButton).toBeEnabled();

        await checkboxes[0].click();
        await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);
        await expect(saveButton).toBeDisabled();
      }
    },
  );
});

test.describe('Checkbox Interaction', () => {
  test('should toggle checkbox from checked to unchecked', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getEmailNotificationSettingsSection(page);
    const checkboxes = await getAllCheckboxes(section);

    if (checkboxes.length > 0) {
      const firstCheckbox = checkboxes[0];
      const initialState = await firstCheckbox.isChecked();

      await firstCheckbox.click();
      await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);

      const newState = await firstCheckbox.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test('should toggle multiple checkboxes independently', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getEmailNotificationSettingsSection(page);
    const checkboxes = await getAllCheckboxes(section);

    if (checkboxes.length >= 2) {
      const firstCheckbox = checkboxes[0];
      const secondCheckbox = checkboxes[1];

      const firstInitialState = await firstCheckbox.isChecked();
      const secondInitialState = await secondCheckbox.isChecked();

      await firstCheckbox.click();
      await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);

      const firstNewState = await firstCheckbox.isChecked();
      const secondUnchangedState = await secondCheckbox.isChecked();

      expect(firstNewState).toBe(!firstInitialState);
      expect(secondUnchangedState).toBe(secondInitialState);
    }
  });

  test(
    'should not allow toggling when save is in progress',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEmailNotificationSettingsSection(page);
      const checkboxes = await getAllCheckboxes(section);
      const saveButton = getSaveButton(section);

      if (checkboxes.length > 0) {
        const firstCheckbox = checkboxes[0];

        await firstCheckbox.click();
        await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);
        await expect(saveButton).toBeEnabled();

        const savePromise = saveButton.click();

        const allCheckboxes = await getAllCheckboxes(section);
        await Promise.all(
          allCheckboxes.map(async (checkbox) => {
            await expect(checkbox).toBeDisabled();
          }),
        );

        await savePromise;
      }
    },
  );
});

test.describe('Form Submission', () => {
  test(
    'should successfully save notification preference changes',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEmailNotificationSettingsSection(page);
      const checkboxes = await getAllCheckboxes(section);
      const saveButton = getSaveButton(section);

      if (checkboxes.length > 0) {
        const firstCheckbox = checkboxes[0];
        const initialState = await firstCheckbox.isChecked();

        await firstCheckbox.click();
        await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);

        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        await expect(saveButton).toBeDisabled({ timeout: 10000 });

        const newState = await firstCheckbox.isChecked();
        expect(newState).toBe(!initialState);
      }
    },
  );

  test('should persist changes after page reload', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getEmailNotificationSettingsSection(page);
    const initialStates = await getCheckboxStates(section);
    const checkboxes = await getAllCheckboxes(section);
    const saveButton = getSaveButton(section);

    if (checkboxes.length > 0) {
      await checkboxes[0].click();
      await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);
      await saveButton.click();

      await expect(saveButton).toBeDisabled({ timeout: 10000 });

      await page.reload();
      await page.waitForTimeout(PAGE_RELOAD_WAIT);

      const sectionAfterReload = getEmailNotificationSettingsSection(page);
      const newStates = await getCheckboxStates(sectionAfterReload);

      expect(newStates.length).toBe(initialStates.length);
      expect(newStates[0]).toBe(!initialStates[0]);
    }
  });

  test(
    'should successfully save multiple checkbox changes at once',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEmailNotificationSettingsSection(page);
      const checkboxes = await getAllCheckboxes(section);
      const saveButton = getSaveButton(section);

      if (checkboxes.length >= 2) {
        const firstInitialState = await checkboxes[0].isChecked();
        const secondInitialState = await checkboxes[1].isChecked();

        await checkboxes[0].click();
        await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);
        await checkboxes[1].click();
        await page.waitForTimeout(CHECKBOX_TOGGLE_WAIT);

        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        await expect(saveButton).toBeDisabled({ timeout: 10000 });

        const firstNewState = await checkboxes[0].isChecked();
        const secondNewState = await checkboxes[1].isChecked();

        expect(firstNewState).toBe(!firstInitialState);
        expect(secondNewState).toBe(!secondInitialState);
      }
    },
  );
});

test.describe('Error Handling', () => {
  test('should handle loading state gracefully', { tag: TEST_TAGS }, async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(LOADING_STATE_WAIT);

    const section = getEmailNotificationSettingsSection(page);
    await expect(section).toBeVisible({ timeout: 10000 });
  });
});
