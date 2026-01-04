/* eslint-disable react-func/max-lines-per-function, max-lines */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { switchToTranslationMode, switchToReadingMode } from '@/tests/helpers/mode-switching';
import { createTranslationConfig, mockPreferencesApi } from '@/tests/helpers/preferences-api-mocks';
import Homepage from '@/tests/POM/home-page';

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
    const verse = page.getByTestId(`verse-${verseKey}`);
    const moreButton = verse.getByTestId('verse-actions-more');
    await expect(moreButton).toBeVisible();
    await moreButton.click();
  } else {
    // Open verse actions menu from reading view
    const verse = page.getByTestId(`verse-arabic-${verseKey}`);
    await verse.click();

    // Open More submenu (handles both mobile button and desktop menuitem)
    const moreMenuitem = page.getByTestId('verse-actions-menu-more');
    const moreButton = page.getByTestId('verse-actions-more');

    await Promise.race([moreMenuitem.click(), moreButton.click()]);
  }

  // Select Translation Feedback option
  const translationFeedbackOption = page.getByTestId('verse-actions-menu-translation-feedback');
  await expect(translationFeedbackOption).toBeVisible();
  await translationFeedbackOption.click();

  // Modal should open
  const modal = page.getByTestId('modal-content');
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
  const translationSelectTrigger = page.getByTestId('translation-select-trigger');
  await translationSelectTrigger.click();

  // Click the desired option
  const option = page.getByTestId(`translation-select-option-${translationId}`);
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
      await expect(page.getByTestId('translation-select-label')).toBeVisible();
      await expect(page.getByTestId('translation-select-trigger')).toBeVisible();
      await expect(page.getByTestId('translation-feedback-textarea')).toBeVisible();
      await expect(page.getByTestId('translation-feedback-submit-button')).toBeVisible();

      // As per spec when there is only one translation in user's preferences, that should be selected by default
      await expect(page.getByTestId('translation-preview-131')).toBeVisible();
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
      await expect(page.getByTestId('translation-select-label')).toBeVisible();
      await expect(page.getByTestId('translation-select-trigger')).toBeVisible();
      await expect(page.getByTestId('translation-feedback-textarea')).toBeVisible();
      await expect(page.getByTestId('translation-feedback-submit-button')).toBeVisible();

      // As per spec when there is only one translation in user's preferences, that should be selected by default
      await expect(page.getByTestId('translation-preview-131')).toBeVisible();
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
      const translationSelect = page.getByTestId('translation-select-trigger');
      await expect(translationSelect).toBeVisible();

      // Open the popover to see options
      await translationSelect.click();

      // Should have at least one translation option (from user preferences)
      // Note: Exact options depend on user's selected translations
      const options = page.getByTestId(/translation-select-option-/);
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
      const reportButton = page.getByTestId('translation-feedback-submit-button');
      await reportButton.click();

      // Verify both fields should show validation errors, user has 3 translations in their preferences so no translation should be default selected
      await expect(page.getByTestId('translation-error-required-field')).toBeVisible();
      await expect(page.getByTestId('feedback-error-required-field')).toBeVisible();

      // Test partial form - feedback only
      const feedbackTextarea = page.getByTestId('translation-feedback-textarea');
      await feedbackTextarea.fill('This is a test feedback');
      await reportButton.click();

      // Translation error persists, feedback error clears
      await expect(page.getByTestId('translation-error-required-field')).toBeVisible();
      await expect(page.getByTestId('feedback-error-required-field')).not.toBeVisible();

      // Test partial form - translation only
      await selectTranslationOption(page, '131');
      await feedbackTextarea.clear();
      await reportButton.click();

      // Feedback error appears, translation error clears
      await expect(page.getByTestId('translation-error-required-field')).not.toBeVisible();
      await expect(page.getByTestId('feedback-error-required-field')).toBeVisible();

      // Test maximum length validation (exceeds 10000 character limit)
      const longText = 'a'.repeat(10001);
      await feedbackTextarea.fill(longText);
      await reportButton.click();
      await expect(page.getByTestId('feedback-error-maximum-length')).toBeVisible();
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
      await expect(page.getByTestId('translation-preview-131')).toBeVisible();
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

      const feedbackTextarea = page.getByTestId('translation-feedback-textarea');
      await feedbackTextarea.fill('This is a test feedback about the translation.');

      // Submit the form
      const reportButton = page.getByTestId('translation-feedback-submit-button');
      await reportButton.click();

      // Should show success toast
      await expect(page.getByTestId('success-toast')).toBeVisible();

      // Modal should be closed
      const modal = page.getByTestId('modal-content');
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

      const feedbackTextarea = page.getByTestId('translation-feedback-textarea');
      await feedbackTextarea.fill('This is a test feedback about the translation.');

      // Submit the form
      const reportButton = page.getByTestId('translation-feedback-submit-button');
      await reportButton.click();

      // Should show error toast
      await expect(page.getByTestId('error-toast')).toBeVisible();

      // Modal should still be open
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
      const modal = page.getByTestId('modal-content');
      await expect(modal).toBeVisible();

      await page.keyboard.press('Escape');

      // Modal should be closed
      await expect(modal).toBeHidden();
    },
  );
});
