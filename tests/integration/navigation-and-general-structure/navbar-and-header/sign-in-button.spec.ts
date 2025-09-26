import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test(
  'Sign In button redirects to the login page',
  { tag: ['@slow', '@navbar'] },
  async ({ page }) => {
    // Click on the Sign In Button and verify it goes to the /login page
    const logoElement = page.getByLabel('Sign in');
    await logoElement.click();

    // Make sure we are redirected to the homepage
    await expect(page).toHaveURL(/\/login/);
  },
);
