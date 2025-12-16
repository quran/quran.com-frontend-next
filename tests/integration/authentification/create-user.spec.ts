/* eslint-disable react-func/max-lines-per-function */

import { test, expect, Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/login');
});

test(
  'A user can create an account and reach the verification code step',
  { tag: ['@slow', '@auth', '@create-user'] },
  async ({ page }) => {
    // Email form should be visible immediately (no need to click "Continue with Email")
    // Click on the "Sign Up" tab - use test ID to avoid ambiguity
    await page.getByTestId('signup-button').click();

    // Fill in the form fields with default values
    await fillInSignUpForm(page);

    // Submit the form - use form locator to target the submit button, not the tab button
    await page.locator('form').getByRole('button', { name: 'Sign up' }).click();

    // The "verification-code" component should be visible
    const verificationCodeComponent = page.getByTestId('verification-code');
    await expect(verificationCodeComponent).toBeVisible();
  },
);

test(
  'Password validation works correctly',
  { tag: ['@auth', '@create-user'] },
  async ({ page }) => {
    // Email form should be visible immediately (no need to click "Continue with Email")
    // Click on the "Sign Up" tab - use test ID to avoid ambiguity
    await page.getByTestId('signup-button').click();

    // Get the password validation component
    const passwordValidation = page.getByTestId('password-validation');
    await expect(passwordValidation).not.toBeVisible();

    // When typing a password, the password validation should appear
    const passwordInput = page.getByPlaceholder('Password', { exact: true });
    await passwordInput.click();
    await passwordInput.fill('Test');
    await expect(passwordValidation).toBeVisible();

    // Check that the rules are validated correctly for a short password "Test"

    // For "Test": Min (invalid), Max (valid), Uppercase (valid), Lowercase (valid), Number (invalid), Special (invalid)
    await expectPasswordValidation({
      min: false,
      max: true,
      uppercase: true,
      lowercase: true,
      number: false,
      special: false,
    });

    // Now fill a strong valid password and assert all rules become valid
    await passwordInput.fill('TestPassword1!');
    await expectPasswordValidation({
      min: true,
      max: true,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
    });

    // Now fill a password that's too long and assert the max rule becomes invalid
    await passwordInput.fill('TestPassword1234567890!');
    await expectPasswordValidation({
      min: true,
      max: false,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
    });
  },
);

test('Sign up with an existing email shows an error', async ({ page }) => {
  test.skip(!process.env.TEST_USER_EMAIL, 'No credentials provided');

  // Click on the "Sign Up" tab
  const signUpTab = page.getByTestId('signup-button');
  await signUpTab.click();

  await fillInSignUpForm(page);
  // Use an existing email
  await page.getByPlaceholder('Email address').fill(process.env.TEST_USER_EMAIL || '');

  // Submit the form - use form locator to target the submit button, not the tab button
  await page.locator('form').getByRole('button', { name: 'Sign up' }).click();

  // We should see an error message
  const errorMessage = page.getByText('Email already exists');
  await expect(errorMessage).toBeVisible();
});

// Helper to get password validation rules
async function getRules(page: Page) {
  const passwordValidation = page.getByTestId('password-validation');
  const minRule = passwordValidation.locator('div', { hasText: 'Min 8 characters' });
  const maxRule = passwordValidation.locator('div', { hasText: 'Max 20 characters' });
  const uppercaseRule = passwordValidation.locator('div', {
    hasText: 'At least one uppercase letter',
  });
  const lowercaseRule = passwordValidation.locator('div', {
    hasText: 'At least one lowercase letter',
  });
  const numberRule = passwordValidation.locator('div', { hasText: 'At least one number' });
  const specialRule = passwordValidation.locator('div', {
    hasText: 'At least one special character (!@#$%^&*_-)',
  });

  return { minRule, maxRule, uppercaseRule, lowercaseRule, numberRule, specialRule };
}

// Helper to check password validation rules
async function expectPasswordValidation({
  min,
  max,
  uppercase,
  lowercase,
  number,
  special,
}: {
  min: boolean;
  max: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}) {
  const { minRule, maxRule, uppercaseRule, lowercaseRule, numberRule, specialRule } =
    await getRules(homePage.page);

  await expect(minRule.locator(`img[alt="${min ? 'Valid' : 'Invalid'}"]`)).toBeVisible();
  await expect(maxRule.locator(`img[alt="${max ? 'Valid' : 'Invalid'}"]`)).toBeVisible();
  await expect(
    uppercaseRule.locator(`img[alt="${uppercase ? 'Valid' : 'Invalid'}"]`),
  ).toBeVisible();
  await expect(
    lowercaseRule.locator(`img[alt="${lowercase ? 'Valid' : 'Invalid'}"]`),
  ).toBeVisible();
  await expect(numberRule.locator(`img[alt="${number ? 'Valid' : 'Invalid'}"]`)).toBeVisible();
  await expect(specialRule.locator(`img[alt="${special ? 'Valid' : 'Invalid'}"]`)).toBeVisible();
}

async function fillInSignUpForm(page: Page) {
  const uniqueId = Date.now();
  await page.getByPlaceholder('First Name').fill('John');
  await page.getByPlaceholder('Last Name').fill('Doe');
  await page.getByPlaceholder('Email address').fill(`john.doe${uniqueId}@example.com`);
  await page.getByPlaceholder('Username').fill(`johndoe${uniqueId}`);
  await page.getByPlaceholder('Password', { exact: true }).fill('TestPassword123!');
  await page.getByPlaceholder('Confirm password', { exact: true }).fill('TestPassword123!');
}
