/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

test.describe('Widget defaults from user settings', () => {
  test(
    'Uses the user-selected font and translations as defaults',
    { tag: ['@widget', '@settings'] },
    async ({ page, context, isMobile }) => {
      test.skip(isMobile);

      test.slow();
      const homePage = new Homepage(page, context);

      // 1. Go to /1
      await homePage.goTo('/1');

      // 2. Open settings and select IndoPak font
      await homePage.openSettingsDrawer();
      await page.getByTestId('text_indopak-button').click();

      // 3. Select Muhammad Hamidullah translation
      await page.getByTestId('translation').click();
      await page.getByTestId('translation-card').click();
      const settingsBody = page.getByTestId('settings-drawer-body');
      await settingsBody.getByText('Dr. Mustafa Khattab').click(); // uncheck default
      await settingsBody.getByText('Muhammad Hamidullah').click();

      // 4. Go to /embed
      await page.goto('/embed', { waitUntil: 'networkidle' });
      const widgetFrame = page.frameLocator('iframe');
      await expect(widgetFrame.locator('.quran-widget')).toBeVisible();

      // 5. Verify the widget preview reflects Hamidullah + IndoPak ayah marker
      await expect(
        widgetFrame.getByText('Certes, Allah et Ses Anges prient sur le Prophète;', {
          exact: false,
        }),
      ).toBeVisible();
      await expect(widgetFrame.locator('[data-testid="verse-arabic-33:56"]').first()).toContainText(
        '۟',
      );
    },
  );

  test(
    'Uses the site language for the widget locale',
    { tag: ['@widget', '@settings'] },
    async ({ page, context }) => {
      const homePage = new Homepage(page, context);

      // 1. Go to /1
      await homePage.goTo('/1');

      // 2. Switch the site language to French
      await page.getByTestId('open-navigation-drawer').click();
      await page.getByTestId('language-selector-button').click();
      await Promise.all([
        page.getByTestId('language-item-fr').click(),
        page.waitForURL((url) => url.pathname.startsWith('/fr')),
      ]);

      await page.waitForTimeout(500); // wait for language to fully propagate

      // 3. Go to /embed (should stay in French)
      await page.goto('/fr/embed', { waitUntil: 'networkidle' });
      const widgetFrame = page.frameLocator('iframe');
      await expect(widgetFrame.locator('.quran-widget')).toBeVisible();

      // 4. Verify widget header uses the French label
      await expect(widgetFrame.locator('.quran-widget')).toContainText('Sourate');
    },
  );

  test(
    'Widget overrides persist across tabs',
    { tag: ['@widget', '@settings'] },
    async ({ page, context, isMobile }) => {
      test.skip(isMobile);

      test.slow();
      const homePage = new Homepage(page, context);

      // 1. Go to /1
      await homePage.goTo('/1');

      // 2. Select IndoPak font and Muhammad Hamidullah translation
      await homePage.openSettingsDrawer();
      await page.getByTestId('text_indopak-button').click();
      await page.getByTestId('translation').click();
      await page.getByTestId('translation-card').click();
      const settingsBody = page.getByTestId('settings-drawer-body');
      await settingsBody.getByText('Dr. Mustafa Khattab').click(); // uncheck default
      await settingsBody.getByText('Muhammad Hamidullah').click();

      // 3. Go to /embed and set verse 50
      await page.goto('/embed', { waitUntil: 'networkidle' });
      const previewFrame = page.frameLocator('iframe');
      await expect(previewFrame.locator('.quran-widget')).toBeVisible();
      await page.locator('#ayah-select').selectOption('50');

      // 4. Select another translation and another mushaf
      await page.locator('#translation-search').fill('Saheeh');
      await page.getByText('Saheeh International').first().click();
      await page.locator('#mushaf-select').selectOption('tajweed');
      await expect(page.locator('#mushaf-select')).toHaveValue('tajweed');
      await expect(page.locator('#ayah-select')).toHaveValue('50');

      // 5. Open a new tab with the same Redux store and go to /embed
      const newPage = await context.newPage();
      await newPage.goto('/embed', { waitUntil: 'networkidle' });
      const newTabFrame = newPage.frameLocator('iframe');
      await expect(newTabFrame.locator('.quran-widget')).toBeVisible();

      // 6. Verify overrides persisted (mushaf + translation + verse 50)
      await expect(newPage.locator('#mushaf-select')).toHaveValue('tajweed');
      await expect(newPage.locator('#ayah-select')).toHaveValue('50');
      await expect(newTabFrame.locator('.quran-widget')).toContainText('Ô Prophète');
    },
  );
});
