import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

test(
  'desktop: settings gear opens the settings drawer',
  { tag: ['@reader', '@settings', '@desktop'] },
  async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await homePage.goTo('/1');

    await homePage.openSettingsDrawer();

    await expect(page.getByTestId('settings-drawer')).toBeVisible();
    await expect(page.getByTestId('settings-drawer-body')).toBeVisible();
  },
);

test.skip(
  'mobile: gear works before and after scroll (navbar hidden)',
  { tag: ['@reader', '@settings', '@mobile'] },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await homePage.goTo('/1');

    // Test settings button before scroll
    await homePage.openSettingsDrawer();
    await expect(page.getByTestId('settings-drawer')).toBeVisible();
    await expect(page.getByTestId('settings-drawer-body')).toBeVisible();

    // Close the drawer
    await page
      .getByTestId('settings-drawer')
      .getByRole('button', { name: /close drawer/i })
      .first()
      .click();

    // Scroll to bottom to hide navbar
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Test settings button after scroll (should use floating button)
    const settingsButtons = page.locator('#settings-button');
    await expect(settingsButtons.last()).toBeVisible();
    await settingsButtons.last().click();
    await expect(page.getByTestId('settings-drawer')).toBeVisible();
    await expect(page.getByTestId('settings-drawer-body')).toBeVisible();
  },
);
