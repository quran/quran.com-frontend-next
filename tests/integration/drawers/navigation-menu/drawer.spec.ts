import { test, expect } from '@playwright/test';

import { TestId } from '@/tests/test-ids';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Navigation drawer icon should open the drawer when clicked', async ({ page }) => {
  // 1. Make sure the navigation drawer is not visible before opening it
  await expect(page.locator('text=Menu')).not.toBeVisible();

  // 2. Click to open the drawer [aria-label="Open Navigation Drawer"]
  await page.locator('[aria-label="Open Navigation Drawer"]').click();

  // 3. Make sure the navigation drawer is visible after opening it
  await expect(page.locator('text=Menu')).toBeVisible();
});

test('Navigation drawer close icon should close the drawer', async ({ page }) => {
  // 1. Open the navigation menu drawer
  await page.getByTestId(TestId.OPEN_NAVIGATION_DRAWER).click();

  // 2. Make sure the navigation drawer is visible after opening it
  await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).toBeVisible();

  // 3. Click on the close drawer button
  await page.getByTestId(TestId.NAVIGATION_DRAWER_CLOSE_BUTTON).nth(2).click();

  // 4. Make sure the navigation drawer is no longer visible after closing it
  await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).not.toBeVisible();
});
