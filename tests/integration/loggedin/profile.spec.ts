/* eslint-disable react-func/max-lines-per-function */
import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test(
  'Profile icon should show up in the navbar',
  { tag: ['@slow', '@auth', '@login-user'] },
  async ({ page }) => {
    const profileAvatarButton = page.getByTestId('profile-avatar-button');
    await expect(profileAvatarButton).toHaveCount(2);
    await expect(profileAvatarButton.nth(0)).toBeVisible();
    await expect(profileAvatarButton.nth(1)).toBeVisible();
  },
);
