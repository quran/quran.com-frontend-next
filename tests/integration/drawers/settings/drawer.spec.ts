import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test('Settings drawer icon should open the drawer when clicked', async ({ page }) => {
  // 1. Make sure the drawer has no children before opening it
  // Ensure the drawer has no children before opening it
  await expect(page.getByTestId('settings-drawer-container')).not.toBeVisible();
  // 2. Click the settings drawer trigger
  await homePage.openSettingsDrawer();
  // 3. Make sure the settings drawer is visible
  await expect(page.getByTestId('settings-drawer-container')).toBeVisible();
});
