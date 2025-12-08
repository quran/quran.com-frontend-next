import path from 'path';

import { test as setup, expect } from '@playwright/test';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Perform authentication using the app's email login flow (same as tests/integration/authentification/login.spec.ts)
  // Uses environment variables TEST_USER_EMAIL and TEST_USER_PASSWORD. The test will be skipped
  // if they are not provided by the CI/local environment.

  // Open the login page (Playwright will resolve relative URLs if baseURL is configured)
  await page.goto('/login');

  // Fill in credentials from environment variables
  if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
    // make the test framework aware this should be skipped when creds missing
    // we still throw to make failure explicit in setup if desired; alternative is to skip.
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set for auth.setup to run');
  }

  await page.getByPlaceholder('Email address').fill(process.env.TEST_USER_EMAIL || '');
  await page.getByPlaceholder('Password').fill(process.env.TEST_USER_PASSWORD || '');

  // Submit the login form
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click();

  // Wait for redirect to home and visible profile avatar
  await page.waitForURL(/\/$/);
  await expect(page.getByTestId('profile-avatar-button')).toBeVisible();

  // Save signed-in state to 'authFile'.
  await page.context().storageState({ path: authFile });
});
