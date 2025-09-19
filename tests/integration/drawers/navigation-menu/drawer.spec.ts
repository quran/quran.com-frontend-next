import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Go to the home page
  await page.goto('/');

  // Hide the nextjs error overlay to be able to click on elements behind it
  await page.addStyleTag({
    content: `
      nextjs-portal {
        display: none;
      }
    `,
  });
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

  // 2. Click on the feedback nav item (has href="https://feedback.quran.com/")
  // and make sure it opens in a new
  await page.locator('[href="https://feedback.quran.com/"]').first().click();

  // 3. Make sure a new tab is opened with the correct url
  const newPage = await page.context().waitForEvent('page');
  await newPage.waitForLoadState();
  expect(newPage.url()).toBe('https://feedback.quran.com/');
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
