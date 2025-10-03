import { test, expect } from '@playwright/test';

import {
  mockTranslationHamidullah,
  mockTranslationKhattab,
  mockTranslationSaheeh,
} from '@/tests/mocks/translations';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1');
});

test.describe('Translation Selection', () => {
  test(
    'All available translations are displayed in settings',
    { tag: ['@fast', '@translations', '@settings'] },
    async ({ page }) => {
      // 1. Click on the button
      await page.getByLabel('Change Translation').click();

      // 2. Check that the settings drawer is opened and the translations card is clicked
      const settingsBody = page.getByTestId('settings-drawer-container');

      // check that the translations list is visible
      await expect(settingsBody.getByText(mockTranslationKhattab().resourceName)).toBeVisible();
      await expect(settingsBody.getByText(mockTranslationSaheeh().resourceName)).toBeVisible();
      await expect(settingsBody.getByText(mockTranslationHamidullah().resourceName)).toBeVisible();
    },
  );

  test(
    'Translation search functionality filters results correctly',
    { tag: ['@fast', '@translations', '@search'] },
    async ({ page }) => {
      // 1. Open the translation selection drawer
      await page.getByLabel('Change Translation').click();

      // 2. In the settings-drawer-body, we should see the translations list
      const settingsBody = page.getByTestId('settings-drawer-container');

      // 3. Type "French" in the search input
      const searchInput = settingsBody.getByPlaceholder('Search Translations');
      await searchInput.fill('French');

      // 4. We should only see French translations now
      await expect(settingsBody.getByText(mockTranslationSaheeh().resourceName)).not.toBeVisible();
      await expect(settingsBody.getByText(mockTranslationKhattab().resourceName)).not.toBeVisible();
      await expect(settingsBody.getByText(mockTranslationHamidullah().resourceName)).toBeVisible();

      // 5. Clear the search input
      await searchInput.fill('');

      // 6. We should see all translations again
      await expect(settingsBody.getByText(mockTranslationHamidullah().resourceName)).toBeVisible();
      await expect(settingsBody.getByText(mockTranslationSaheeh().resourceName)).toBeVisible();
      await expect(settingsBody.getByText(mockTranslationKhattab().resourceName)).toBeVisible();
    },
  );
});

// eslint-disable-next-line react-func/max-lines-per-function
test.describe('Translation Display and Persistence', () => {
  test(
    'Multiple translation selection persists and displays correctly',
    { tag: ['@slow', '@translations', '@persistence'] },
    async ({ page }) => {
      // 1. Open the settings drawer
      await page.getByLabel('Change Translation').click();

      // 2. In the settings-drawer-body, we should see the translations list
      const settingsBody = page.getByTestId('settings-drawer-container');

      // 3. Select two translations
      await settingsBody.getByText(mockTranslationKhattab().resourceName).click(); // uncheck
      await settingsBody.getByText(mockTranslationSaheeh().resourceName).click(); // check
      await settingsBody.getByText(mockTranslationHamidullah().resourceName).click(); // check

      // Wait for the selection to take effect: Khattab hidden, Saheeh and Hamidullah visible
      const firstVerse = page.getByTestId('verse-1:1');
      await expect(firstVerse.getByText(mockTranslationKhattab().text)).not.toBeVisible();
      await expect(firstVerse.getByText(mockTranslationSaheeh().text)).toBeVisible();
      await expect(firstVerse.getByText(mockTranslationHamidullah().text)).toBeVisible();

      // 4. reload the page
      await page.goto('/1', { waitUntil: 'networkidle' });

      // 5. check if verse 1:1 has the selected translations
      await expect(firstVerse.getByText(mockTranslationKhattab().text)).not.toBeVisible(); // Dr. Mustafa Khattab should not be visible (we unchecked it)
      await expect(firstVerse.getByText(mockTranslationSaheeh().text)).toBeVisible(); // Saheeh International
      await expect(firstVerse.getByText(mockTranslationHamidullah().text)).toBeVisible(); // Muhammad Hamidullah
    },
  );

  test(
    'Author names display when multiple translations are selected',
    { tag: ['@fast', '@translations', '@display'] },
    async ({ page }) => {
      // 1. Check that the author names is not shown (only one translation is selected by default)
      await expect(
        page.getByTestId('verse-1:1').getByText(mockTranslationKhattab().authorName),
      ).not.toBeVisible();

      // 2. Open the translation selection drawer
      await page.getByLabel('Change Translation').click();

      // 3. In the settings-drawer-body, we should see the translations list
      const settingsBody = page.getByTestId('settings-drawer-container');

      // 4. Select two translations (Dr. Mustafa Khattab is selected by default)
      await settingsBody.getByText(mockTranslationHamidullah().resourceName).click(); // check

      // 5. Check that the author names are shown
      await expect(
        page.getByTestId('verse-1:1').getByText(mockTranslationKhattab().authorName),
      ).toBeVisible();
    },
  );
});
