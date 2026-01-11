/* eslint-disable react-func/max-lines-per-function */
import { test, expect, Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/login');
});

test(
  'Login to an existing user works and redirects to the home page',
  { tag: ['@slow', '@auth', '@login-user', '@smoke'] },
  async ({ page }) => {
    await openEmailLogin(page);

    // Fill in the form fields with the credentials of an existing user
    await fillInLoginForm(page);

    // Submit the form
    await page.getByRole('button', { name: /continue|sign in/i }).click();

    // We should be redirected to the home page
    await page.waitForURL(/\/([a-z]{2})?$/);
    await expect(page).toHaveURL(/\/([a-z]{2})?$/);

    // We should be logged in
    const profileAvatarButton = page.getByTestId('profile-avatar-button');
    await expect(profileAvatarButton).toHaveCount(2);
    await expect(profileAvatarButton.nth(0)).toBeVisible();
    await expect(profileAvatarButton.nth(1)).toBeVisible();
  },
);

test(
  'Login shows error message when using wrong credentials',
  { tag: ['@auth', '@login-user'] },
  async ({ page }) => {
    await openEmailLogin(page);

    // Fill in the form fields with wrong credentials
    await page.getByPlaceholder(/Email( address)?/i).fill('wrong@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    // Submit the form
    await page.getByRole('button', { name: /continue|sign in/i }).click();
    // We should see an error message
    const errorMessage = page.getByText('Invalid email or password');
    await expect(errorMessage).toBeVisible();
  },
);

test(
  'Login form shows validation errors when fields are empty',
  { tag: ['@auth', '@login-user'] },
  async ({ page }) => {
    await openEmailLogin(page);
    // Submit the form without filling in the fields
    await page.getByRole('button', { name: /continue|sign in/i }).click();
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

  await page.getByPlaceholder(/Email( address)?/i).fill(process.env.TEST_USER_EMAIL || '');
  await page.getByPlaceholder('Password').fill(process.env.TEST_USER_PASSWORD || '');
};

const openEmailLogin = async (page: Page): Promise<void> => {
  const authButtons = page.getByTestId('auth-buttons');
  if (await authButtons.count()) {
    const continueWithEmailButton = authButtons.getByText('Email');
    if (await continueWithEmailButton.isVisible()) {
      await continueWithEmailButton.click();
    }
  }
};
