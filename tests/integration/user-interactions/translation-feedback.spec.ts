import { test, expect } from '@playwright/test';

import { switchToTranslationMode, switchToReadingMode } from '@/tests/helpers/mode-switching';
import Homepage from '@/tests/POM/home-page';
import { TestId, getVerseTestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1/1');
});

test.describe('Translation Feedback - Guest Users', () => {
  test(
    'Guest user should be redirected to login page when clicking Translation Feedback from translation view',
    { tag: ['@translation-feedback', '@auth', '@guest'] },
    async ({ page }) => {
      // Set translation mode to access verse actions menu
      await switchToTranslationMode(page);

      // Open verse actions menu
      const verse = page.getByTestId(getVerseTestId('1:1'));
      const moreButton = verse.getByTestId(TestId.VERSE_ACTIONS_MORE);
      await expect(moreButton).toBeVisible();
      await moreButton.click();

      // Select Translation Feedback option
      const translationFeedbackOption = page.getByTestId(
        TestId.VERSE_ACTIONS_MENU_TRANSLATION_FEEDBACK,
      );
      await expect(translationFeedbackOption).toBeVisible();
      await translationFeedbackOption.click();

      // Should be redirected to login page
      await expect(page).toHaveURL(/\/login/);
    },
  );

  test(
    'Guest user should be redirected to login page when clicking Translation Feedback from reading view',
    { tag: ['@translation-feedback', '@auth', '@guest'] },
    async ({ page }) => {
      // Set reading mode to test verse interaction
      await switchToReadingMode(page);

      // Tap verse to reveal actions menu
      const verse = page.getByTestId('verse-arabic-1:1');
      await verse.click();

      // Open More submenu (handles both mobile button and desktop menuitem)
      const moreMenuitem = page.getByTestId(TestId.VERSE_ACTIONS_MENU_MORE);
      const moreButton = page.getByTestId(TestId.VERSE_ACTIONS_MORE);
      await Promise.race([moreMenuitem.click(), moreButton.click()]);

      const translationFeedbackOption = page.getByTestId(
        TestId.VERSE_ACTIONS_MENU_TRANSLATION_FEEDBACK,
      );
      await expect(translationFeedbackOption).toBeVisible();
      await translationFeedbackOption.click();

      // Should be redirected to login page
      await expect(page).toHaveURL(/\/login/);
    },
  );
});
