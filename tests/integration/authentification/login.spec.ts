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
    // Click on the "Continue with Email" button
    const authButtons = page.getByTestId('auth-buttons');
    const continueWithEmailButton = authButtons.getByText('Email');
    await continueWithEmailButton.click();

    // Fill in the form fields with the credentials of an existing user
    await fillInLoginForm(page);

    // Submit the form
    await page.getByRole('button', { name: 'Continue' }).click();

    // We should be redirected to the home page
    await page.waitForURL(/\/$/);
    await expect(page).toHaveURL(/\/$/);

    // We should be logged in
    await expect(page.getByTestId('profile-avatar-button')).toBeVisible();
  },
);

test(
  'Login shows error message when using wrong credentials',
  { tag: ['@auth', '@login-user'] },
  async ({ page }) => {
    // Click on the "Continue with Email" button
    const authButtons = page.getByTestId('auth-buttons');
    const continueWithEmailButton = authButtons.getByText('Email');
    await continueWithEmailButton.click();

    // Fill in the form fields with wrong credentials
    await page.getByPlaceholder('Email').fill('wrong@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    // Submit the form
    await page.getByRole('button', { name: 'Continue' }).click();
    // We should see an error message
    const errorMessage = page.getByText('Invalid email or password');
    await expect(errorMessage).toBeVisible();
  },
);

test(
  'Login form shows validation errors when fields are empty',
  { tag: ['@auth', '@login-user'] },
  async ({ page }) => {
    // Click on the "Continue with Email" button
    const authButtons = page.getByTestId('auth-buttons');
    const continueWithEmailButton = authButtons.getByText('Email');
    await continueWithEmailButton.click();
    // Submit the form without filling in the fields
    await page.getByRole('button', { name: 'Continue' }).click();
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

  await page.getByPlaceholder('Email').fill(process.env.TEST_USER_EMAIL || '');
  await page.getByPlaceholder('Password').fill(process.env.TEST_USER_PASSWORD || '');
};
