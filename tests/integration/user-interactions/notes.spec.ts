/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import { switchToTranslationMode, switchToReadingMode } from '@/tests/helpers/mode-switching';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

// It can have locale prefix and query params
const loginPageRegex = /(?:\/[a-z]{2})?\/login(?:\?.*)?$/;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1/1');
});

test.describe('Notes - Guest Users', () => {
  test.describe('Translation View', () => {
    test(
      'should redirect to login page when clicking notes button',
      { tag: ['@notes', '@auth', '@guest', '@translation-view'] },
      async ({ page }) => {
        // Given: User is in translation mode
        await switchToTranslationMode(page);

        // When: User clicks the notes button on a verse
        const verse = page.getByTestId('verse-1:1');
        const notesButton = verse.getByTestId('notes-action-button');
        await expect(notesButton).toBeVisible();
        await notesButton.click();

        // Then: User should be redirected to login page
        await page.waitForURL(loginPageRegex);
        await expect(page).toHaveURL(loginPageRegex);
      },
    );
  });

  test.describe('Reading View', () => {
    test(
      'should redirect to login page when clicking notes menu item',
      { tag: ['@notes', '@auth', '@guest', '@reading-view'] },
      async ({ page }) => {
        // Given: User is in reading mode
        await switchToReadingMode(page);

        // When: User clicks on verse to show actions menu and selects notes
        const verse = page.getByTestId('verse-arabic-1:1');
        await verse.click();

        const notesMenuItem = page
          .getByTestId('notes-menu-item')
          .or(page.getByTestId('notes-action-button'));

        await expect(notesMenuItem).toBeVisible();
        await notesMenuItem.click();

        // Then: User should be redirected to login page
        await page.waitForURL(loginPageRegex);
        await expect(page).toHaveURL(loginPageRegex);
      },
    );
  });
});
