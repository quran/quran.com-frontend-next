import { test, expect } from '@playwright/test';

import { openNavigationDrawer } from '@/tests/helpers/navigation';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

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
      await openNavigationDrawer(page);
      await page.getByTestId(TestId.CHANGE_THEME_BUTTON).click();

      const autoButton = page.getByTestId('theme-option-auto');
      await expect(autoButton).toHaveClass(/Selected/);
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
      await openNavigationDrawer(page);
      // 3. Click on the light theme
      await page.getByTestId(TestId.CHANGE_THEME_BUTTON).click();
      await page.getByTestId('theme-option-light').click();
      // 4. Make sure the light theme is the currently selected theme
      bodyTheme = await page.locator('body').getAttribute('data-theme');
      expect(bodyTheme).toBe('light');
    },
  );
});
