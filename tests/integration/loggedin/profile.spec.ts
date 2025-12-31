import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test(
  'Profile icon should show up in the navbar',
  { tag: ['@slow', '@auth', '@login-user'] },
  async ({ page }) => {
    const profileAvatarButton = page.getByTestId(TestId.PROFILE_AVATAR_BUTTON);
    await expect(profileAvatarButton).toHaveCount(2);
    await expect(profileAvatarButton.nth(0)).toBeVisible();
    await expect(profileAvatarButton.nth(1)).toBeVisible();
  },
);
