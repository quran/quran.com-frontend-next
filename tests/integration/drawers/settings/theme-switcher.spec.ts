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

  await page.waitForLoadState('networkidle');
});

test.describe('Theme Switcher', () => {
  test('Auto should be selected by default', async ({ page, context }) => {
    const homepage = new Homepage(page, context);
    // 1. Open the settings drawer
    await homepage.openSettingsDrawer();
    // 2. get the current active theme
    const activeTheme = await page.getByTestId('auto-button').getAttribute('data-is-selected');
    expect(activeTheme).toBe('true');
  });

  test('Selecting a non-default theme should change the active theme', async ({
    page,
    context,
  }) => {
    let bodyTheme = await page.locator('body').getAttribute('data-theme');
    const homepage = new Homepage(page, context);
    // 1. Make sure the auto theme is the currently selected theme
    expect(bodyTheme).toBe('auto');
    // 2. Open the settings drawer
    await homepage.openSettingsDrawer();
    // 3. Click on the light theme
    await page.getByTestId('light-button').click();
    // 4. Make sure the light theme is the currently selected theme
    bodyTheme = await page.locator('body').getAttribute('data-theme');
    expect(bodyTheme).toBe('light');
  });
});
