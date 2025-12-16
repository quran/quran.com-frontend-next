/* eslint-disable react-func/max-lines-per-function, max-lines */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { switchToTranslationMode, switchToReadingMode } from '@/tests/helpers/mode-switching';
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
    const moreButton = verse.getByLabel('More');
    await expect(moreButton).toBeVisible();
    await moreButton.click();
  } else {
    // Open verse actions menu from reading view
    const verse = page.getByTestId(`verse-arabic-${verseKey}`);
    await verse.click();

    // Open More submenu (handles both mobile button and desktop menuitem)
    const moreMenuitem = page.getByRole('menuitem', { name: 'More' });
    const moreButton = page.getByLabel('More');

    await Promise.race([moreMenuitem.click(), moreButton.click()]);
  }

  // Select Translation Feedback option
  const translationFeedbackOption = page.getByRole('menuitem', {
    name: 'Translation Feedback',
  });
  await expect(translationFeedbackOption).toBeVisible();
  await translationFeedbackOption.click();

  // Modal should open
  const modal = page.getByTestId('modal-content');
  await expect(modal).toBeVisible();
};

/**
 * Selects a translation option in the translation feedback modal.
 *
 * By default, this function selects the translation with ID `131`.
 * This ID is expected to exist in the user's preferences and is used
 * to ensure that translation data is properly loaded before continuing.
 */
const selectTranslationOption = async (page: Page, translationId: string = '131') => {
  const translationSelect = page.getByTestId('translation-select');
  await translationSelect.selectOption(translationId);
};

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);

  await homePage.goTo('/1/1');
});

test.describe('Translation Feedback - Logged In Users', () => {
  test(
    'Logged-in user can open translation feedback modal from translation view',
    { tag: ['@translation-feedback', '@auth', '@logged-in', '@smoke'] },
    async ({ page }) => {
      // Set translation mode to ensure consistent starting state
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Should contain translation feedback form elements
      await expect(page.getByText('Select translation')).toBeVisible();
      await expect(
        page.getByPlaceholder(
          'Use this space to report an issue relating to the selected translation of this Ayah.',
        ),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Report' })).toBeVisible();
    },
  );

  test(
    'Logged-in user can open translation feedback modal from reading view',
    { tag: ['@translation-feedback', '@auth', '@logged-in'] },
    async ({ page }) => {
      // Set reading mode for consistent test state
      await switchToReadingMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'reading');

      // Should contain translation feedback form elements
      await expect(page.getByText('Select translation')).toBeVisible();
      await expect(
        page.getByPlaceholder(
          'Use this space to report an issue relating to the selected translation of this Ayah.',
        ),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Report' })).toBeVisible();
    },
  );

  test(
    'Translation selection dropdown shows user preferences',
    { tag: ['@translation-feedback', '@form-validation'] },
    async ({ page }) => {
      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Check translation dropdown
      const translationSelect = page.getByTestId('translation-select');
      await expect(translationSelect).toBeVisible();

      // Should have at least one translation option (from user preferences)
      // Note: Exact options depend on user's selected translations
      const options = translationSelect.locator('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
    },
  );

  test(
    'Translation feedback form validation works correctly',
    { tag: ['@translation-feedback', '@form-validation'] },
    async ({ page }) => {
      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Test empty form submission
      const reportButton = page.getByRole('button', { name: 'Report' });
      await reportButton.click();

      // Verify both fields show validation errors
      await expect(page.getByText('Translation is required')).toBeVisible();
      await expect(page.getByText('Feedback is required')).toBeVisible();

      // Test partial form - feedback only
      const feedbackTextarea = page.getByPlaceholder(
        'Use this space to report an issue relating to the selected translation of this Ayah.',
      );
      await feedbackTextarea.fill('This is a test feedback');
      await reportButton.click();

      // Translation error persists, feedback error clears
      await expect(page.getByText('Translation is required')).toBeVisible();
      await expect(page.getByText('Feedback is required')).not.toBeVisible();

      // Test partial form - translation only
      await selectTranslationOption(page, '131'); // Must be in user's preferences
      await feedbackTextarea.clear();
      await reportButton.click();

      // Feedback error appears, translation error clears
      await expect(page.getByText('Translation is required')).not.toBeVisible();
      await expect(page.getByText('Feedback is required')).toBeVisible();
    },
  );

  test(
    'Feedback text validation enforces minimum and maximum length',
    { tag: ['@translation-feedback', '@form-validation'] },
    async ({ page }) => {
      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      const translationSelect = page.getByTestId('translation-select');
      await translationSelect.selectOption('131'); // This one must be available in authenticated user's preferences

      const feedbackTextarea = page.getByPlaceholder(
        'Use this space to report an issue relating to the selected translation of this Ayah.',
      );
      const reportButton = page.getByRole('button', { name: 'Report' });

      // Test empty input validation
      await feedbackTextarea.fill('');
      await reportButton.click();
      await expect(page.getByText('Feedback is required')).toBeVisible();

      // Test whitespace-only input validation
      await feedbackTextarea.fill('   '); // Only spaces
      await reportButton.click();
      await expect(page.getByText('Feedback is required')).toBeVisible();

      // Test maximum length validation (exceeds 10000 character limit)
      const longText = 'a'.repeat(10001);
      await feedbackTextarea.fill(longText);
      await reportButton.click();
      await expect(page.getByText('Feedback cannot exceed 10000 characters')).toBeVisible();
    },
  );

  test(
    'Translation preview shows selected translation text',
    { tag: ['@translation-feedback', '@ui'] },
    async ({ page }) => {
      // Ensure we're in translation mode
      await switchToTranslationMode(page);

      // Open translation feedback modal
      await openTranslationFeedbackModal(page, 'translation');

      // Select a translation
      await selectTranslationOption(page, '131'); // This one must be available in authenticated user's preferences

      // Should show translation preview
      const modal = page.getByTestId('modal-content');
      await expect(
        modal.getByText('In the Name of Allah—the Most Compassionate, Most Merciful.'),
      ).toBeVisible();
    },
  );

  test(
    'Successful feedback submission shows success toast and closes modal',
    { tag: ['@translation-feedback', '@submission', '@success'] },
    async ({ page }) => {
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

      const feedbackTextarea = page.getByPlaceholder(
        'Use this space to report an issue relating to the selected translation of this Ayah.',
      );
      await feedbackTextarea.fill('This is a test feedback about the translation.');

      // Submit the form
      const reportButton = page.getByRole('button', { name: 'Report' });
      await reportButton.click();

      // Should show success toast
      await expect(page.getByText('Your feedback is sent successfully')).toBeVisible();

      // Modal should be closed
      const modal = page.getByTestId('modal-content');
      await expect(modal).toBeHidden();
    },
  );

  test(
    'Failed feedback submission shows error toast and keeps modal open',
    { tag: ['@translation-feedback', '@submission', '@error'] },
    async ({ page }) => {
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

      const feedbackTextarea = page.getByPlaceholder(
        'Use this space to report an issue relating to the selected translation of this Ayah.',
      );
      await feedbackTextarea.fill('This is a test feedback about the translation.');

      // Submit the form
      const reportButton = page.getByRole('button', { name: 'Report' });
      await reportButton.click();

      // Should show error toast
      await expect(page.getByText('Something went wrong. Please try again.')).toBeVisible();

      // Modal should still be open
      const modal = page.getByTestId('modal-content');
      await expect(modal).toBeVisible();
    },
  );

  test(
    'Cancel action closes modal without submission',
    { tag: ['@translation-feedback', '@ui'] },
    async ({ page }) => {
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
