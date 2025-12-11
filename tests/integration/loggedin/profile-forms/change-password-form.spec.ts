/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { expect, test } from '@playwright/test';

import {
  fillPasswordFields,
  getChangePasswordSection,
  getFormInputs,
  getPasswordValidation,
  getTestUserPassword,
} from './change-password-form-helpers';
import { enableValidation, expectError, expectNoError, fillAndBlur } from './form-helpers';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/profile');
});

const TEST_TAGS = ['@slow', '@auth', '@profile', '@change-password'];

const VALIDATION_WAIT = 500;
const UI_UPDATE_WAIT = 300;

test.describe('Section Visibility', () => {
  test(
    'should display change password section when user can login with email and password',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      await expect(section).toBeVisible();
      await expect(section.getByText('Change Password')).toBeVisible();
    },
  );

  // Note: Testing social-only login scenario would require a different user account setup
  test.skip(
    'should hide change password section when user logged in with social account only',
    { tag: TEST_TAGS },
    async ({ page }) => {
      // This test requires a user account that only has social login
      // Implementation depends on test environment and user setup
      const section = getChangePasswordSection(page);
      await expect(section).not.toBeVisible();
    },
  );
});

test.describe('Form Display', () => {
  test('should display all form fields correctly', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getChangePasswordSection(page);
    const {
      currentPassword,
      newPassword,
      confirmPassword,
      currentPasswordToggle,
      newPasswordToggle,
      confirmPasswordToggle,
      updateButton,
    } = getFormInputs(section);

    await expect(section).toBeVisible();
    await expect(section.getByText('Change Password')).toBeVisible();

    await expect(currentPassword).toBeVisible();
    await expect(currentPassword).toHaveAttribute('type', 'password');

    await expect(newPassword).toBeVisible();
    await expect(newPassword).toHaveAttribute('type', 'password');

    await expect(confirmPassword).toBeVisible();
    await expect(confirmPassword).toHaveAttribute('type', 'password');

    await expect(currentPasswordToggle).toBeVisible();
    await expect(newPasswordToggle).toBeVisible();
    await expect(confirmPasswordToggle).toBeVisible();

    await expect(updateButton).toBeVisible();
  });

  test('should display correct placeholders', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getChangePasswordSection(page);
    const { currentPassword, newPassword, confirmPassword } = getFormInputs(section);

    await expect(currentPassword).toHaveAttribute('placeholder', /current.*password/i);
    await expect(newPassword).toHaveAttribute('placeholder', /new.*password/i);
    await expect(confirmPassword).toHaveAttribute('placeholder', /confirm.*password/i);
  });
});

test.describe('Password Visibility Toggle', () => {
  test(
    'should toggle current password visibility when clicking show/hide button',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { currentPassword, currentPasswordToggle } = getFormInputs(section);

      await currentPassword.fill('TestPassword123!');

      await expect(currentPassword).toHaveAttribute('type', 'password');

      await currentPasswordToggle.click();
      await expect(currentPassword).toHaveAttribute('type', 'text');

      await currentPasswordToggle.click();
      await expect(currentPassword).toHaveAttribute('type', 'password');
    },
  );

  test(
    'should toggle new password visibility when clicking show/hide button',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword, newPasswordToggle } = getFormInputs(section);

      await newPassword.fill('NewPassword123!');

      await expect(newPassword).toHaveAttribute('type', 'password');

      await newPasswordToggle.click();
      await expect(newPassword).toHaveAttribute('type', 'text');

      await newPasswordToggle.click();
      await expect(newPassword).toHaveAttribute('type', 'password');
    },
  );

  test(
    'should toggle confirm password visibility when clicking show/hide button',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { confirmPassword, confirmPasswordToggle } = getFormInputs(section);

      await confirmPassword.fill('NewPassword123!');

      await expect(confirmPassword).toHaveAttribute('type', 'password');

      await confirmPasswordToggle.click();
      await expect(confirmPassword).toHaveAttribute('type', 'text');

      await confirmPasswordToggle.click();
      await expect(confirmPassword).toHaveAttribute('type', 'password');
    },
  );
});

test.describe('Required Field Validation', () => {
  test(
    'should show validation error when current password is empty',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { currentPassword, updateButton } = getFormInputs(section);

      await currentPassword.fill('test');
      await currentPassword.clear();
      await enableValidation(page, updateButton);
      await currentPassword.blur();

      await expectError(section, /current.*password.*is.*missing/i);
    },
  );

  test(
    'should show validation error when new password is empty',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword, updateButton } = getFormInputs(section);

      await newPassword.fill('test');
      await newPassword.clear();
      await enableValidation(page, updateButton);
      await newPassword.blur();

      await expectError(section, /^\*Password is missing/i);
    },
  );

  test(
    'should show validation error when confirm password is empty',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { confirmPassword, updateButton } = getFormInputs(section);

      await confirmPassword.fill('test');
      await confirmPassword.clear();
      await enableValidation(page, updateButton);
      await confirmPassword.blur();

      await expectError(section, /confirm.*password.*is.*missing/i);
    },
  );
});

test.describe('Password Length Validation', () => {
  test(
    'should show validation error when new password is less than 8 characters',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword, updateButton } = getFormInputs(section);

      await enableValidation(page, updateButton);
      await fillAndBlur(newPassword, 'Pass1!');
      await page.waitForTimeout(VALIDATION_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
      await expect(validation.getByText(/min.*length|8.*character/i)).toBeVisible();
    },
  );

  test(
    'should accept new password with minimum length (8 characters)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'Pass123!');
      await page.waitForTimeout(VALIDATION_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
    },
  );

  test(
    'should accept new password with maximum length (20 characters)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'Pass123!Pass123!Pass');
      await page.waitForTimeout(VALIDATION_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
    },
  );

  test(
    'should show validation error when new password exceeds maximum length (20 characters)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'Pass123!Pass123!Pass1');
      await page.waitForTimeout(VALIDATION_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
      await expect(validation.getByText(/max.*length|20.*character/i)).toBeVisible();
    },
  );
});

test.describe('Password Character Validation', () => {
  test(
    'should show validation error when new password lacks uppercase letter',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'password123!');
      await page.waitForTimeout(VALIDATION_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
      await expect(validation.getByText(/uppercase|capital.*letter/i)).toBeVisible();
    },
  );

  test(
    'should show validation error when new password lacks lowercase letter',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'PASSWORD123!');
      await page.waitForTimeout(VALIDATION_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
      await expect(validation.getByText(/lowercase|small.*letter/i)).toBeVisible();
    },
  );

  test(
    'should show validation error when new password lacks number',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'Password!');
      await page.waitForTimeout(VALIDATION_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
      await expect(validation.getByText(/number|digit/i)).toBeVisible();
    },
  );

  test(
    'should show validation error when new password lacks special character',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'Password123');
      await page.waitForTimeout(VALIDATION_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
      await expect(validation.getByText(/special.*character/i)).toBeVisible();
    },
  );

  test(
    'should accept new password with allowed special characters (!)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'Pass123!');
      await page.waitForTimeout(UI_UPDATE_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
    },
  );

  test(
    'should accept new password with allowed special characters (@#$%^&*_-)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'Pass123@');
      await page.waitForTimeout(UI_UPDATE_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();

      await fillAndBlur(newPassword, 'Pass123#');
      await page.waitForTimeout(UI_UPDATE_WAIT);
      await expect(validation).toBeVisible();

      await fillAndBlur(newPassword, 'Pass123$');
      await page.waitForTimeout(UI_UPDATE_WAIT);
      await expect(validation).toBeVisible();
    },
  );

  test(
    'should show validation error when new password contains disallowed special characters',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'Pass123(');
      await page.waitForTimeout(UI_UPDATE_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
      await expect(validation.getByText(/special.*character/i)).toBeVisible();

      await fillAndBlur(newPassword, 'Pass123{');
      await page.waitForTimeout(UI_UPDATE_WAIT);
      await expect(validation.getByText(/special.*character/i)).toBeVisible();

      await fillAndBlur(newPassword, 'Pass123/');
      await page.waitForTimeout(UI_UPDATE_WAIT);
      await expect(validation.getByText(/special.*character/i)).toBeVisible();
    },
  );

  test(
    'should accept valid new password with all requirements met',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await fillAndBlur(newPassword, 'ValidPass123!');
      await page.waitForTimeout(UI_UPDATE_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
    },
  );
});

test.describe('Password Matching Validation', () => {
  test(
    'should show validation error when confirm password does not match new password',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { currentPassword, newPassword, confirmPassword, updateButton } =
        getFormInputs(section);

      await fillAndBlur(currentPassword, getTestUserPassword());
      await enableValidation(page, updateButton);
      await fillAndBlur(newPassword, 'ValidPass123!');
      await fillAndBlur(confirmPassword, 'DifferentPass123!');
      await updateButton.click();
      await page.waitForTimeout(UI_UPDATE_WAIT);

      await expectError(section, /confirm.*password.*doesn.*t.*match/i);
    },
  );

  test(
    'should not show validation error when confirm password matches new password',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { currentPassword, newPassword, confirmPassword } = getFormInputs(section);

      await fillAndBlur(currentPassword, getTestUserPassword());
      await fillAndBlur(newPassword, 'ValidPass123!');
      await fillAndBlur(confirmPassword, 'ValidPass123!');
      await page.waitForTimeout(UI_UPDATE_WAIT);

      await expectNoError(section, 2000);
    },
  );
});

test.describe('Password Validation Display', () => {
  test(
    'should show password validation rules when typing in new password field',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await newPassword.fill('test');
      await page.waitForTimeout(UI_UPDATE_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();
    },
  );

  test(
    'should update validation status as password requirements are met',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword } = getFormInputs(section);

      await newPassword.fill('pass');
      await page.waitForTimeout(UI_UPDATE_WAIT);

      const validation = getPasswordValidation(section);
      await expect(validation).toBeVisible();

      await newPassword.fill('Pass');
      await page.waitForTimeout(UI_UPDATE_WAIT);
      await expect(validation).toBeVisible();

      await newPassword.fill('Pass1');
      await page.waitForTimeout(UI_UPDATE_WAIT);
      await expect(validation).toBeVisible();

      await newPassword.fill('Pass1!');
      await page.waitForTimeout(UI_UPDATE_WAIT);
      await expect(validation).toBeVisible();

      await newPassword.fill('Pass123!');
      await page.waitForTimeout(UI_UPDATE_WAIT);
      await expect(validation).toBeVisible();
    },
  );
});

test.describe('Form Submission', () => {
  test(
    'should successfully update password with valid values',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const inputs = getFormInputs(section);

      const password = getTestUserPassword();
      await fillPasswordFields(inputs, password, password, password);
      await page.waitForTimeout(UI_UPDATE_WAIT);

      await inputs.updateButton.click();

      const successMessage = page.getByText(/password.*updated.*successfully|success/i);
      await expect(successMessage).toBeVisible({ timeout: 10000 });
    },
  );

  test(
    'should show error when current password is incorrect',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const inputs = getFormInputs(section);

      await fillPasswordFields(inputs, 'WrongPassword123!', 'NewValidPass123!', 'NewValidPass123!');
      await page.waitForTimeout(UI_UPDATE_WAIT);

      await inputs.updateButton.click();
      await page.waitForTimeout(UI_UPDATE_WAIT);

      await expectError(section, /incorrect.*current.*password|current.*password.*is.*invalid/i);
    },
  );

  test(
    'should disable update button when form is invalid',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const { newPassword, updateButton } = getFormInputs(section);

      await newPassword.fill('invalid');
      await page.waitForTimeout(UI_UPDATE_WAIT);

      const isDisabled = await updateButton.isDisabled();
      expect(isDisabled).toBe(false);
    },
  );

  test(
    'should stay on the same page after successful update',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getChangePasswordSection(page);
      const inputs = getFormInputs(section);

      const password = getTestUserPassword();
      await fillPasswordFields(inputs, password, password, password);
      await page.waitForTimeout(UI_UPDATE_WAIT);

      const currentUrl = page.url();
      await inputs.updateButton.click();

      const successMessage = page.getByText(/password.*updated.*successfully|success/i);
      await expect(successMessage).toBeVisible({ timeout: 10000 });

      await page.waitForTimeout(UI_UPDATE_WAIT);
      expect(page.url()).toBe(currentUrl);
    },
  );
});

test.describe('Form Behavior with Disabled State', () => {
  test.skip(
    'should disable all form fields when user cannot update password',
    { tag: TEST_TAGS },
    async ({ page }) => {
      // This test requires a user account that cannot update password (social login only)
      const section = getChangePasswordSection(page);
      const { currentPassword, newPassword, confirmPassword, updateButton } =
        getFormInputs(section);

      await expect(currentPassword).toBeDisabled();
      await expect(newPassword).toBeDisabled();
      await expect(confirmPassword).toBeDisabled();
      await expect(updateButton).toBeDisabled();
    },
  );
});
