/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import { switchToTranslationMode, switchToReadingMode } from '@/tests/helpers/mode-switching';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

// Global ayah configuration
const ayah = {
  surah: 1,
  ayah: 1,
};

// It can have locale prefix and query params
const loginPageRegex = /(?:\/[a-z]{2})?\/login(?:\?.*)?$/;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);
});

test.describe('Notes - Guest Users', () => {
  test.describe('Translation View', () => {
    test(
      'should redirect to login page when clicking notes button',
      { tag: ['@notes', '@auth', '@guest', '@translation-view'] },
      async ({ page }) => {
        // User is in translation mode
        await switchToTranslationMode(page);

        // Click the notes button on a verse
        const verse = page.getByTestId(`verse-${ayah.surah}:${ayah.ayah}`);
        const notesButton = verse.getByTestId('notes-action-button');
        await expect(notesButton).toBeVisible();
        await notesButton.click();

        // Verify user is redirected to login page
        await expect(page).toHaveURL(loginPageRegex);
      },
    );
  });

  test.describe('Reading View', () => {
    test(
      'should redirect to login page when clicking notes menu item',
      { tag: ['@notes', '@auth', '@guest', '@reading-view'] },
      async ({ page }) => {
        // User is in reading mode
        await switchToReadingMode(page);

        // Click on verse to show actions menu and select notes
        const verse = page.getByTestId(`verse-arabic-${ayah.surah}:${ayah.ayah}`);
        await verse.click();

        const notesMenuItem = page
          .getByTestId('notes-menu-item')
          .or(page.getByTestId('notes-action-button'));

        await expect(notesMenuItem).toBeVisible();
        await notesMenuItem.click();

        // Verify user is redirected to login page
        await expect(page).toHaveURL(loginPageRegex);
      },
    );
  });
});
