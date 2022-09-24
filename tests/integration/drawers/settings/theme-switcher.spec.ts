import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Theme Switcher', () => {
  test('Auto should be selected by default', async ({ page, context }) => {
    const homepage = new Homepage(page, context);
    // 1. Open the settings drawer
    await homepage.openSettingsDrawer();
    // 2. get the current active theme
    const activeTheme = await page.locator('.ThemeSection_iconActive__Q_xs9 + span').textContent();
    expect(activeTheme).toBe('Auto');
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
    await page.locator('button:has-text("Light")').click();
    // 4. Make sure the light theme is the currently selected theme
    bodyTheme = await page.locator('body').getAttribute('data-theme');
    expect(bodyTheme).toBe('light');
  });
});
