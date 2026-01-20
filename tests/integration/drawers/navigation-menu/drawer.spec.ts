import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test('Navigation drawer icon should open the drawer when clicked', async ({ page }) => {
  // 1. Make sure the navigation drawer is not visible before opening it
  await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).not.toBeVisible();

  // 2. Click to open the drawer [aria-label="Open Navigation Drawer"]
  await page.getByTestId(TestId.OPEN_NAVIGATION_DRAWER).click();

  // 3. Make sure the navigation drawer is visible after opening it
  await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).toBeVisible();
});

test('Navigation drawer close icon should close the drawer', async ({ page }) => {
  // 1. Open the navigation menu drawer
  await page.getByTestId(TestId.OPEN_NAVIGATION_DRAWER).click();

  // 2. Make sure the navigation drawer is visible after opening it
  await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).toBeVisible();

  // 3. Click on the close drawer button
  await page.getByTestId(TestId.NAVIGATION_DRAWER_CLOSE_BUTTON).nth(1).click();

  // 4. Make sure the navigation drawer is no longer visible after closing it
  await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).not.toBeVisible();
});
