import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Settings drawer icon should open the drawer when clicked', async ({ page }) => {
  // 1. Make sure the theme section is not visible
  await expect(page.locator('button:has-text("Light")')).not.toBeVisible();
  // 2. Click the settings drawer trigger
  await page.locator('[aria-label="Change Settings"]').click();
  // 3. Make sure the theme section is visible
  await expect(page.locator('button:has-text("Light")')).toBeVisible();
  await expect(page.locator('button:has-text("Sepia")')).toBeVisible();
  await expect(page.locator('button:has-text("Dark")')).toBeVisible();
});

test.describe('Theme Switcher', () => {
  test('Auto should be selected by default', async ({ page }) => {
    // 1. Open the settings drawer
    await page.locator('[aria-label="Change Settings"]').click();
    // 2. get the current active theme
    const activeTheme = await page.locator('.ThemeSection_iconActive__Q_xs9 + span').textContent();
    expect(activeTheme).toBe('Auto');
  });
  test('Selecting a non-default theme should change the active theme', async ({ page }) => {
    let bodyTheme = await page.locator('body').getAttribute('data-theme');
    // 1. Make sure the auto theme is the currently selected theme
    expect(bodyTheme).toBe('auto');
    // 2. Open the settings drawer
    await page.locator('[aria-label="Change Settings"]').click();
    // 3. Click on the light theme
    await page.locator('button:has-text("Light")').click();
    // 4. Make sure the light theme is the currently selected theme
    bodyTheme = await page.locator('body').getAttribute('data-theme');
    expect(bodyTheme).toBe('light');
  });
});
