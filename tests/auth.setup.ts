import path from 'path';

import { test as setup, expect } from '@playwright/test';

import { loginWithEmail } from '@/tests/helpers/auth';
import { TestId } from '@/tests/test-ids';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Perform authentication using the app's email login flow (same as tests/integration/authentification/login.spec.ts)
  // Uses environment variables TEST_USER_EMAIL and TEST_USER_PASSWORD. The test will be skipped
  // if they are not provided by the CI/local environment.

  // Open the login page (Playwright will resolve relative URLs if baseURL is configured)
  if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set for auth.setup to run');
  }

  await loginWithEmail(page, {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
  });

  const profileAvatarButton = page.getByTestId(TestId.PROFILE_AVATAR_BUTTON).first();
  await expect(profileAvatarButton).toBeAttached();

  // Save signed-in state to 'authFile'.
  await page.context().storageState({ path: authFile });
});
