import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1');
});

test(
  'Settings drawer icon should open the drawer when clicked',
  {
    tag: ['@navbar', '@settings', '@fast', '@smoke'],
  },
  async ({ page }) => {
    // 1. Make sure the drawer has no children before opening it
    // Ensure the drawer has no children before opening it
    await expect(page.getByTestId(TestId.SETTINGS_DRAWER_BODY)).not.toBeVisible();
    // 2. Click the settings drawer trigger
    await homePage.openSettingsDrawer();
    // 3. Make sure the settings drawer is visible
    await expect(page.getByTestId(TestId.SETTINGS_DRAWER_BODY)).toBeVisible();
  },
);

test(
  'Escape key should close the settings drawer when it is open (desktop only)',
  {
    tag: ['@navbar', '@settings'],
  },
  async ({ page, isMobile }) => {
    test.skip(isMobile, "This test is not applicable for mobile as there's no Escape key");

    // 1. Open the settings drawer first
    await homePage.openSettingsDrawer();
    await expect(page.getByTestId(TestId.SETTINGS_DRAWER_BODY)).toBeVisible();

    // 2. Press the Escape key to close the drawer
    await page.keyboard.press('Escape');

    // 3. Make sure the settings drawer is not visible anymore
    await expect(page.getByTestId(TestId.SETTINGS_DRAWER_BODY)).not.toBeVisible();
  },
);

test(
  'Clicking outside the settings drawer should close it (desktop only)',
  {
    tag: ['@navbar', '@settings'],
  },
  async ({ page, isMobile }) => {
    test.skip(
      isMobile,
      'This test is skipped on mobile as the settings drawer takes the full screen, so clicking outside is not possible.',
    );

    // 1. Open the settings drawer first
    await homePage.openSettingsDrawer();
    await expect(page.getByTestId(TestId.SETTINGS_DRAWER_BODY)).toBeVisible();

    // 2. Click outside the drawer
    await page.click('body');

    // 3. Make sure the settings drawer is no longer visible
    await expect(page.getByTestId(TestId.SETTINGS_DRAWER_BODY)).not.toBeVisible();
  },
);
