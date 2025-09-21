import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

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
  // 1. Make sure the drawer has no children before opening it
  // Ensure the drawer has no children before opening it
  await expect(page.getByTestId('settings-drawer-container')).not.toBeVisible();
  // 2. Click the settings drawer trigger
  await homepage.openSettingsDrawer();
  // 3. Make sure the settings drawer is visible
  await expect(page.getByTestId('settings-drawer-container')).toBeVisible();
});
