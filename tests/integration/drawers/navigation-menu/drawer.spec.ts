import { test, expect } from '@playwright/test';

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

test('Feedback item should open in a new tab', async ({ page }) => {
  // 1. Open the navigation menu drawer
  await page.locator('[aria-label="Open Navigation Drawer"]').click();

  // 2. Make sure feedback.quran.com opens in a new tab
  await Promise.all([
    page.waitForEvent('popup'),
    page
      .locator(
        'a:nth-child(11) .LinkContainer_anchor__bOj_o .NavigationDrawerItem_container__ZbHp6 .NavigationDrawerItem_innerContainer__KIZpr',
      )
      .click(), // Feedback nav item
  ]);
});

test('Navigation drawer close icon should close the drawer', async ({ page }) => {
  // 1. Open the navigation menu drawer
  await page.locator('[aria-label="Open Navigation Drawer"]').click();

  // 2. Make sure the navigation drawer is visible after opening it
  await expect(page.locator('text=Menu')).toBeVisible();

  // 3. Clock on the close drawer button
  await page.locator('[aria-label="Close Drawer"]').first().click();

  // 4. Make sure the navigation drawer is no longer visible after closing it
  await expect(page.locator('text=Menu')).not.toBeVisible();
});
