import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
});

test('Navigation drawer icon opens the drawer when clicked', async ({ page }) => {
  // 1. Make sure the navigation drawer is not visible before opening it
  await expect(page.locator('text=Menu')).not.toBeVisible();

  // 2. Click to open the drawer [aria-label="Open Navigation Drawer"]
  await page.locator('[aria-label="Open Navigation Drawer"]').click();

  // 3. Make sure the navigation drawer is not visible after opening it
  await expect(page.locator('text=Menu')).toBeVisible();
});
