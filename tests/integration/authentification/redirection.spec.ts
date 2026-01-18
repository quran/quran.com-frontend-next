import { test, expect, Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';
import { PROTECTED_ROUTES } from '@/utils/navigation';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
});

const loginUser = async (page: Page) => {
  test.skip(
    !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
    'No credentials provided',
  );

  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Email address').fill(process.env.TEST_USER_EMAIL || '');
  await page.getByPlaceholder('Password').fill(process.env.TEST_USER_PASSWORD || '');
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/([a-z]{2})?$/);
};

test.describe('Logout Redirection Behavior', () => {
  test(
    'Logging out from protected page redirects to homepage',
    { tag: ['@slow', '@auth', '@logout', '@redirection'] },
    async ({ page }) => {
      await loginUser(page);

      await homepage.goTo(PROTECTED_ROUTES[0]);

      const profileAvatarButton = page.getByTestId(TestId.PROFILE_AVATAR_BUTTON).first();
      await expect(profileAvatarButton).toBeAttached();

      await profileAvatarButton.click();

      const logoutButton = page.getByTestId(TestId.LOGOUT_BUTTON);
      await logoutButton.click();

      await page.waitForURL(/\/([a-z]{2})?$/);
      await expect(page).toHaveURL(/\/([a-z]{2})?$/);
    },
  );

  test(
    'Logging out from unprotected page redirects to current page',
    { tag: ['@slow', '@auth', '@logout', '@redirection'] },
    async ({ page }) => {
      await loginUser(page);

      await homepage.goTo('/1');

      const profileAvatarButton = page.getByTestId(TestId.PROFILE_AVATAR_BUTTON).first();
      await expect(profileAvatarButton).toBeAttached();
      await profileAvatarButton.click();

      const logoutButton = page.getByTestId(TestId.LOGOUT_BUTTON);
      await logoutButton.click();

      await page.waitForURL('/1');
      await expect(page).toHaveURL('/1');
    },
  );
});
