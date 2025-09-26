import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test('Navigation drawer icon should open the drawer when clicked', async ({ page }) => {
  // Make sure the navigation drawer is not visible before opening it
  await expect(page.getByLabel('Navigation Drawer Body')).not.toBeVisible();

  // Click to open the drawer
  await page.getByLabel('Open Navigation Drawer').click();

  // Verify that the drawer is now visible
  await expect(page.getByLabel('Navigation Drawer Body')).toBeVisible();
});
