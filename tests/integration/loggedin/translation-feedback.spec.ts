/* eslint-disable react-func/max-lines-per-function, max-lines */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { switchToTranslationMode, switchToReadingMode } from '@/tests/helpers/mode-switching';
import { createTranslationConfig, mockPreferencesApi } from '@/tests/helpers/preferences-api-mocks';
import Homepage from '@/tests/POM/home-page';
import {
  TestId,
  getTranslationPreviewTestId,
  getTranslationSelectOptionTestId,
  getVerseArabicTestId,
  getVerseTestId,
} from '@/tests/test-ids';

let homePage: Homepage;

/**
 * Open the translation feedback modal from either translation or reading mode
 */
const openTranslationFeedbackModal = async (
  page: Page,
  mode: 'translation' | 'reading' = 'translation',
  verseKey: string = '1:1',
) => {
  if (mode === 'translation') {
    // Open verse actions menu from translation view
    const verse = page.getByTestId(getVerseTestId(verseKey));
    const moreButton = verse.getByTestId(TestId.VERSE_ACTIONS_MORE);
    await expect(moreButton).toBeVisible();
    await moreButton.click();
  } else {
    // Open verse actions menu from reading view
    const verse = page.getByTestId(getVerseArabicTestId(verseKey));
    await verse.click();

    // Open More submenu (handles both mobile button and desktop menuitem)
    const moreMenuitem = page.getByTestId(TestId.VERSE_ACTIONS_MENU_MORE);
    const moreButton = page.getByTestId(TestId.VERSE_ACTIONS_MORE);

    await Promise.race([moreMenuitem.click(), moreButton.click()]);
  }

  // Select Translation Feedback option
  const translationFeedbackOption = page.getByTestId(
    TestId.VERSE_ACTIONS_MENU_TRANSLATION_FEEDBACK,
  );
  await expect(translationFeedbackOption).toBeVisible();
  await translationFeedbackOption.click();

  // Modal should open
  const modal = page.getByTestId(TestId.MODAL_CONTENT);
  await expect(modal).toBeVisible();
};

/**
 * Selects a translation option in the translation feedback modal.
 *
 * By default, this function selects the translation (Dr. Mustafa Khattab) with ID `131`.
 * This ID is expected to exist in the user's preferences and is used
 * to ensure that selected translation data is properly loading.
 */
const selectTranslationOption = async (page: Page, translationId: string = '131') => {
  // Click the translation select trigger to open the dropdown
  const translationSelectTrigger = page.getByTestId(TestId.TRANSLATION_SELECT_TRIGGER);
  await translationSelectTrigger.click();

  // Click the desired option
  const option = page.getByTestId(getTranslationSelectOptionTestId(translationId));
  await expect(option).toBeVisible();
  await option.click();
};

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

test.describe('Translation Feedback - Logged In Users', () => {
  test(
    'Logged-in user can open translation feedback modal from translation view',
    { tag: ['@translation-feedback', '@auth', '@logged-in', '@smoke'] },
    async ({ page }) => {
      await mockPreferencesApi(page, createTranslationConfig(131));
      await homePage.goTo('/1/1');

      // Set translation mode to ensure consistent starting state
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Should contain translation feedback form elements
      await expect(page.getByTestId(TestId.TRANSLATION_SELECT_LABEL)).toBeVisible();
      await expect(page.getByTestId(TestId.TRANSLATION_SELECT_TRIGGER)).toBeVisible();
      await expect(page.getByTestId(TestId.TRANSLATION_FEEDBACK_TEXTAREA)).toBeVisible();
      await expect(page.getByTestId(TestId.TRANSLATION_FEEDBACK_SUBMIT_BUTTON)).toBeVisible();

      // As per spec when there is only one translation in user's preferences, that should be selected by default
      await expect(page.getByTestId(getTranslationPreviewTestId('131'))).toBeVisible();
    },
  );

  test(
    'Logged-in user can open translation feedback modal from reading view',
    { tag: ['@translation-feedback', '@auth', '@logged-in'] },
    async ({ page }) => {
      await mockPreferencesApi(page, createTranslationConfig(131));
      await homePage.goTo('/1/1');

      // Set reading mode for consistent test state
      await switchToReadingMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'reading');

      // Should contain translation feedback form elements
      await expect(page.getByTestId(TestId.TRANSLATION_SELECT_LABEL)).toBeVisible();
      await expect(page.getByTestId(TestId.TRANSLATION_SELECT_TRIGGER)).toBeVisible();
      await expect(page.getByTestId(TestId.TRANSLATION_FEEDBACK_TEXTAREA)).toBeVisible();
      await expect(page.getByTestId(TestId.TRANSLATION_FEEDBACK_SUBMIT_BUTTON)).toBeVisible();

      // As per spec when there is only one translation in user's preferences, that should be selected by default
      await expect(page.getByTestId(getTranslationPreviewTestId('131'))).toBeVisible();
    },
  );

  test(
    'Translation selection dropdown shows user preferences',
    { tag: ['@translation-feedback', '@form-validation'] },
    async ({ page }) => {
      await mockPreferencesApi(page, createTranslationConfig(85, 131, 84));
      await homePage.goTo('/1/1');

      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Check translation dropdown
      const translationSelect = page.getByTestId(TestId.TRANSLATION_SELECT_TRIGGER);
      await expect(translationSelect).toBeVisible();

      // Open the popover to see options
      await translationSelect.click();

      // Should have at least one translation option (from user preferences)
      // Note: Exact options depend on user's selected translations
      const options = page.getByTestId(/^translation-select-option-\d+$/);
      await expect(options).toHaveCount(3);
    },
  );

  test(
    'Translation feedback form validation works correctly',
    { tag: ['@translation-feedback', '@form-validation'] },
    async ({ page }) => {
      await mockPreferencesApi(page, createTranslationConfig(85, 131, 84));
      await homePage.goTo('/1/1');

      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Test empty form submission
      const reportButton = page.getByTestId(TestId.TRANSLATION_FEEDBACK_SUBMIT_BUTTON);
      await reportButton.click();

      // Verify both fields should show validation errors, user has 3 translations in their preferences so no translation should be default selected
      await expect(page.getByTestId(TestId.TRANSLATION_ERROR_REQUIRED_FIELD)).toBeVisible();
      await expect(page.getByTestId(TestId.FEEDBACK_ERROR_REQUIRED_FIELD)).toBeVisible();

      // Test partial form - feedback only
      const feedbackTextarea = page.getByTestId(TestId.TRANSLATION_FEEDBACK_TEXTAREA);
      await feedbackTextarea.fill('This is a test feedback');
      await reportButton.click();

      // Translation error persists, feedback error clears
      await expect(page.getByTestId(TestId.TRANSLATION_ERROR_REQUIRED_FIELD)).toBeVisible();
      await expect(page.getByTestId(TestId.FEEDBACK_ERROR_REQUIRED_FIELD)).not.toBeVisible();

      // Test partial form - translation only
      await selectTranslationOption(page, '131');
      await feedbackTextarea.clear();
      await reportButton.click();

      // Feedback error appears, translation error clears
      await expect(page.getByTestId(TestId.TRANSLATION_ERROR_REQUIRED_FIELD)).not.toBeVisible();
      await expect(page.getByTestId(TestId.FEEDBACK_ERROR_REQUIRED_FIELD)).toBeVisible();

      // Test maximum length validation (exceeds 10000 character limit)
      const longText = 'a'.repeat(10001);
      await feedbackTextarea.fill(longText);
      await reportButton.click();
      await expect(page.getByTestId(TestId.FEEDBACK_ERROR_MAXIMUM_LENGTH)).toBeVisible();
    },
  );

  test(
    'Translation preview shows selected translation text',
    { tag: ['@translation-feedback', '@ui'] },
    async ({ page }) => {
      await mockPreferencesApi(page, createTranslationConfig(85, 131, 84));
      await homePage.goTo('/1/1');

      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Select a translation
      await selectTranslationOption(page, '131');

      // Should show translation preview
      await expect(page.getByTestId(getTranslationPreviewTestId('131'))).toBeVisible();
    },
  );

  test(
    'Successful feedback submission shows success toast and closes modal',
    { tag: ['@translation-feedback', '@submission', '@success'] },
    async ({ page }) => {
      await mockPreferencesApi(page, createTranslationConfig(85, 131, 84));
      await homePage.goTo('/1/1');

      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Mock successful API response
      await page.route('**/translation-feedback', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Fill in the form
      await selectTranslationOption(page, '131'); // This one must be available in authenticated user's preferences

      const feedbackTextarea = page.getByTestId(TestId.TRANSLATION_FEEDBACK_TEXTAREA);
      await feedbackTextarea.fill('This is a test feedback about the translation.');

      // Submit the form
      const reportButton = page.getByTestId(TestId.TRANSLATION_FEEDBACK_SUBMIT_BUTTON);
      await reportButton.click();

      // Should show success toast
      await expect(page.getByTestId(TestId.SUCCESS_TOAST)).toBeVisible();

      // Modal should be closed
      const modal = page.getByTestId(TestId.MODAL_CONTENT);
      await expect(modal).toBeHidden();
    },
  );

  test(
    'Failed feedback submission shows error toast and keeps modal open',
    { tag: ['@translation-feedback', '@submission', '@error'] },
    async ({ page }) => {
      await mockPreferencesApi(page, createTranslationConfig(85, 131, 84));
      await homePage.goTo('/1/1');

      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Mock failed API response
      await page.route('**/translation-feedback', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false }),
        });
      });

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Fill in the form
      await selectTranslationOption(page, '131'); // This one must be available in authenticated user's preferences

      const feedbackTextarea = page.getByTestId(TestId.TRANSLATION_FEEDBACK_TEXTAREA);
      await feedbackTextarea.fill('This is a test feedback about the translation.');

      // Submit the form
      const reportButton = page.getByTestId(TestId.TRANSLATION_FEEDBACK_SUBMIT_BUTTON);
      await reportButton.click();

      // Should show error toast
      await expect(page.getByTestId(TestId.ERROR_TOAST)).toBeVisible();

      // Modal should still be open
      const modal = page.getByTestId(TestId.MODAL_CONTENT);
      await expect(modal).toBeVisible();
    },
  );

  test(
    'Server-side feedback length validation error is handled gracefully',
    { tag: ['@translation-feedback', '@submission', '@validation', '@error-handling'] },
    async ({ page }) => {
      await mockPreferencesApi(page, createTranslationConfig(85, 131, 84));
      await homePage.goTo('/1/1');

      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Mock API response that simulates server-side validation failure
      // This happens when client-side validation passes but server sanitization
      // (e.g., HTML entity encoding) makes the feedback exceed the max length
      await page.route('**/translation-feedback', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            details: {
              error: {
                code: 'ValidationError',
                details: {
                  feedback: 'MAX_LENGTH',
                  translationId: 'MISSING',
                },
              },
            },
          }),
        });
      });

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Fill in the form with valid input that passes client-side validation
      await selectTranslationOption(page, '131');
      const feedbackTextarea = page.getByTestId('translation-feedback-textarea');

      // Use text that would pass client validation but fail server validation after sanitization
      await feedbackTextarea.fill(
        'This feedback contains special characters like & < > that might get encoded and exceed server limits.',
      );

      // Submit the form
      const reportButton = page.getByTestId('translation-feedback-submit-button');
      await reportButton.click();

      // Should show specific validation error message instead of generic error
      await expect(page.getByTestId('feedback-error-maximum-length')).toBeVisible();
      await expect(page.getByTestId('translation-error-required-field')).toBeVisible();
      await expect(page.getByTestId('error-toast')).not.toBeVisible();

      // Modal should remain open so user can correct the feedback
      const modal = page.getByTestId('modal-content');
      await expect(modal).toBeVisible();
    },
  );

  test(
    'Cancel action closes modal without submission',
    { tag: ['@translation-feedback', '@ui'] },
    async ({ page }) => {
      await homePage.goTo('/1/1');

      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Modal should be open
      const modal = page.getByTestId(TestId.MODAL_CONTENT);
      await expect(modal).toBeVisible();

      await page.keyboard.press('Escape');

      // Modal should be closed
      await expect(modal).toBeHidden();
    },
  );
});
