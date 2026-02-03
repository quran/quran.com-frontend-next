import { test, expect, Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/login');
});

test(
  'Login to an existing user works and redirects to the home page',
  { tag: ['@slow', '@auth', '@login-user', '@smoke'] },
  async ({ page }) => {
    // Email form should be visible immediately (no need to click "Continue with Email")

    // Fill in the form fields with the credentials of an existing user
    await fillInLoginForm(page);

    // Submit the form - use form locator to target the submit button, not the tab button
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click();

    // We should be redirected to the home page
    await page.waitForURL(/\/([a-z]{2})?$/);
    await expect(page).toHaveURL(/\/([a-z]{2})?$/);

    // We should be logged in
    const profileAvatarButton = page.getByTestId(TestId.PROFILE_AVATAR_BUTTON).first();
    await expect(profileAvatarButton).toBeAttached();
  },
);

test(
  'Login shows error message when using wrong credentials',
  { tag: ['@auth', '@login-user'] },
  async ({ page }) => {
    // Email form should be visible immediately
    // Fill in the form fields with wrong credentials
    await page.getByTestId('signin-email-input').fill('wrong@example.com');
    await page.getByTestId('signin-password-input').fill('wrongpassword');
    // Submit the form - use form locator to target the submit button, not the tab button
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click();
    // We should see an error message
    const errorMessage = page.getByText('Invalid email or password');
    await expect(errorMessage).toBeVisible();
  },
);

test(
  'Login form shows validation errors when fields are empty',
  { tag: ['@auth', '@login-user'] },
  async ({ page }) => {
    // Email form should be visible immediately
    // Submit the form without filling in the fields - use form locator to target the submit button
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click();
    // We should see validation error messages
    const emailError = page.getByText('Email is missing');
    const passwordError = page.getByText('Password is missing');
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  },
);

const fillInLoginForm = async (page: Page) => {
  test.skip(
    !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
    'No credentials provided',
  );

  await page.getByTestId('signin-email-input').fill(process.env.TEST_USER_EMAIL || '');
  await page.getByTestId('signin-password-input').fill(process.env.TEST_USER_PASSWORD || '');
};
