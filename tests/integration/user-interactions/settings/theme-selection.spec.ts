import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test.describe('Theme Selection', () => {
  test(
    'Auto theme is selected by default',
    { tag: ['@fast', '@settings', '@theme'] },
    async ({ page }) => {
      // 1. Open the settings drawer
      await homePage.openSettingsDrawer();
      // 2. get the current active theme
      const activeTheme = await page.getByTestId('auto-button').getAttribute('data-is-selected');
      expect(activeTheme).toBe('true');
    },
  );

  test(
    'Theme selection changes active theme correctly',
    { tag: ['@fast', '@settings', '@theme'] },
    async ({ page }) => {
      let bodyTheme = await page.locator('body').getAttribute('data-theme');
      // 1. Make sure the auto theme is the currently selected theme
      expect(bodyTheme).toBe('auto');
      // 2. Open the settings drawer
      await homePage.openSettingsDrawer();
      // 3. Click on the light theme
      await page.getByTestId('light-button').click();
      // 4. Make sure the light theme is the currently selected theme
      bodyTheme = await page.locator('body').getAttribute('data-theme');
      expect(bodyTheme).toBe('light');
    },
  );
});
