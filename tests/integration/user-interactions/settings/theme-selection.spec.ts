import { test, expect } from '@playwright/test';

import ThemeType from '@/redux/types/ThemeType';
import { expectThemeSelected, selectTheme } from '@/tests/helpers/settings';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1');
});

test.describe('Theme Selection', () => {
  test(
    'Auto theme is selected by default',
    { tag: ['@fast', '@settings', '@theme'] },
    async ({ page }) => {
      // 1. Open the settings drawer
      await homePage.openSettingsDrawer();
      // 2. get the current active theme
      await expectThemeSelected(page, ThemeType.Auto);
    },
  );

  test(
    'Theme selection changes active theme correctly',
    { tag: ['@fast', '@settings', '@theme', '@smoke'] },
    async ({ page }) => {
      let bodyTheme = await page.locator('body').getAttribute('data-theme');
      // 1. Make sure the auto theme is the currently selected theme
      expect(bodyTheme).toBe('auto');
      // 2. Open the settings drawer
      await homePage.openSettingsDrawer();
      // 3. Click on the light theme
      await selectTheme(page, ThemeType.Light);
      // 4. Make sure the light theme is the currently selected theme
      bodyTheme = await page.locator('body').getAttribute('data-theme');
      expect(bodyTheme).toBe('light');
    },
  );
});
