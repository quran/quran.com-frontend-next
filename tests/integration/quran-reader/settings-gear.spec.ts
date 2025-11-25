import { test, expect } from '@playwright/test';

test('desktop: settings gear opens the settings drawer', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/1');

  const settingsButtons = page.locator('#settings-button');
  await expect(settingsButtons.last()).toBeVisible();
  await settingsButtons.last().click();

  await expect(page.getByTestId('settings-drawer')).toBeVisible();
  await expect(page.locator('#settings-drawer-body')).toBeVisible();
});

test('mobile: gear works before and after scroll (navbar hidden)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/1');

  const settingsButtons = page.locator('#settings-button');
  await expect(settingsButtons.first()).toBeVisible();
  await settingsButtons.first().click();
  await expect(page.getByTestId('settings-drawer')).toBeVisible();
  await expect(page.locator('#settings-drawer-body')).toBeVisible();

  await page
    .getByTestId('settings-drawer')
    .getByRole('button', { name: /close drawer/i })
    .first()
    .click();

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  await expect(settingsButtons.last()).toBeVisible();
  await settingsButtons.last().click();
  await expect(page.getByTestId('settings-drawer')).toBeVisible();
  await expect(page.locator('#settings-drawer-body')).toBeVisible();
});
