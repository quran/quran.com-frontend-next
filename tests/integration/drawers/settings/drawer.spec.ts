import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

test.beforeEach(async ({ page }) => {
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

test('Settings drawer icon should open the drawer when clicked', async ({ page, context }) => {
  const homepage = new Homepage(page, context);
  // 1. Make sure the theme section is not visible
  await expect(page.locator('button:has-text("Light")')).not.toBeVisible();
  // 2. Click the settings drawer trigger
  await homepage.openSettingsDrawer();
  // 3. Make sure the theme section is visible
  await expect(page.locator('button:has-text("Light")')).toBeVisible();
  await expect(page.locator('button:has-text("Sepia")')).toBeVisible();
  await expect(page.locator('button:has-text("Dark")')).toBeVisible();
});
