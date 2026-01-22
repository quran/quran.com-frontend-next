import { test, expect, type Locator, type Page } from '@playwright/test';

import {
  setWordByWordLanguage,
  setWordByWordTooltipEnabled,
  setWordByWordTranslationEnabled,
  setWordByWordTransliterationEnabled,
  withSettingsDrawer,
} from '@/tests/helpers/settings';
import Homepage from '@/tests/POM/home-page';
import { getVerseTestId, TestId } from '@/tests/test-ids';

let homePage: Homepage;

// Helper functions to reduce code duplication
async function hoverFirstWordInVerse2(page: Page): Promise<string | null> {
  const firstWord = page.locator('[data-word-location="78:2:2"]').first();
  await firstWord.hover();

  const verse2 = page.getByTestId(getVerseTestId('78:2'));
  return verse2.textContent();
}

async function openWordByWordModal(
  page: Page,
): Promise<{ wbwTranslation: Locator; wbwTransliteration: Locator }> {
  // Get verse 2
  const verse = page.getByTestId(getVerseTestId('78:2'));
  await expect(verse).toBeVisible();

  // Click on the more button
  const moreButton = verse.getByLabel('More');
  await expect(moreButton).toBeVisible();
  await moreButton.click({ force: true });

  // Click on the role="menuitem" with text "Word By Word"
  const wordByWordButton = page.getByRole('menuitem', { name: 'Word By Word' });
  await expect(wordByWordButton).toBeVisible();
  await wordByWordButton.click({ force: true });

  // Check that the modal is open
  const wbwTranslation = page.getByTestId(TestId.WBW_TRANSLATION);
  await expect(wbwTranslation).toBeVisible();
  const wbwTransliteration = page.getByTestId(TestId.WBW_TRANSLITERATION);
  await expect(wbwTransliteration).toBeVisible();

  return { wbwTranslation, wbwTransliteration };
}

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/78');
});

test.describe('Word by Word Modal', () => {
  test(
    'Should open modal and display word-by-word content correctly',
    { tag: ['@slow', '@reader', '@word-by-word'] },
    async ({ page }) => {
      const { wbwTranslation, wbwTransliteration } = await openWordByWordModal(page);

      // Check that the modal contains the word by word translation and transliteration
      await expect(wbwTranslation.getByText('About', { exact: true })).toBeVisible();
      await expect(wbwTranslation.getByText('the News', { exact: true })).toBeVisible();
      await expect(wbwTranslation.getByText('the Great', { exact: true })).toBeVisible();
      await expect(wbwTransliteration.getByText('ʿani', { exact: true })).toBeVisible();
      await expect(wbwTransliteration.getByText('l-naba-i', { exact: true })).toBeVisible();
      await expect(wbwTransliteration.getByText('l-ʿaẓīmi', { exact: true })).toBeVisible();
    },
  );

  test(
    'Should display word-by-word in German language in modal',
    { tag: ['@reader', '@word-by-word', '@language'] },
    async ({ page }) => {
      test.skip(
        true,
        'Remove .skip when issue is fixed: wbw modal does not have the correct translation',
      );

      await withSettingsDrawer(page, async () => {
        await setWordByWordLanguage(page, 'de'); // (Deutsch)
      });

      const { wbwTranslation } = await openWordByWordModal(page);

      // Check that the modal contains the word by word translation and transliteration
      await expect(wbwTranslation.getByText('Nach', { exact: true })).toBeVisible();
      await expect(wbwTranslation.getByText('der Kunde', { exact: true })).toBeVisible();
      await expect(wbwTranslation.getByText('gewaltigen', { exact: true })).toBeVisible();
    },
  );
});

test.describe('Word by Word Tooltip', () => {
  test(
    'Should show translation tooltip when hovering over a word',
    { tag: ['@reader', '@word-by-word'] },
    async ({ page }) => {
      const tooltip = await hoverFirstWordInVerse2(page);

      // Check that the tooltip contains the word by word translation
      expect(tooltip).toContain('the News');
    },
  );

  test(
    'Should show transliteration tooltip when enabled in settings',
    { tag: ['@reader', '@word-by-word'] },
    async ({ page }) => {
      await withSettingsDrawer(page, async () => {
        await setWordByWordTransliterationEnabled(page, true);
      });

      // Hover over the first word in verse 2
      const tooltip = await hoverFirstWordInVerse2(page);

      // Check that the tooltip contains the word by word transliteration
      expect(tooltip).toContain('l-naba-i');
    },
  );

  test(
    'Should show German translation tooltip when language changed',
    { tag: ['@reader', '@word-by-word', '@language'] },
    async ({ page }) => {
      await withSettingsDrawer(page, async () => {
        await setWordByWordLanguage(page, 'de'); // (Deutsch)
      });

      // Hover over the first word in verse 2
      const tooltip = await hoverFirstWordInVerse2(page);

      // Check that the tooltip contains the word by word translation in German
      expect(tooltip).toContain('der Kunde');
    },
  );

  test(
    'Should not show tooltip when disabled in settings',
    { tag: ['@reader', '@word-by-word'] },
    async ({ page }) => {
      await withSettingsDrawer(page, async () => {
        await setWordByWordTooltipEnabled(page, false);
      });

      // Hover over the first word in verse 2
      const tooltip = await hoverFirstWordInVerse2(page);

      // Check that the tooltip does not contain the word by word translation
      expect(tooltip).not.toContain('the News');
    },
  );
});

test.describe('Word by Word Inline Display', () => {
  test(
    'Should display inline translation and transliteration when enabled',
    { tag: ['@reader', '@word-by-word'] },
    async ({ page }) => {
      await withSettingsDrawer(page, async () => {
        // Navigate to More tab and enable inline display for both translation and transliteration
        await page.getByTestId(TestId.MORE_SETTINGS_TAB).click();

        // Enable inline translation checkbox
        const inlineTranslationCheckbox = page.locator('#inline-translation');
        await inlineTranslationCheckbox.waitFor({ state: 'visible', timeout: 10000 });
        if (!(await inlineTranslationCheckbox.isChecked())) {
          await inlineTranslationCheckbox.locator('xpath=ancestor::label[1]').click();
        }

        // Enable inline transliteration checkbox
        const inlineTransliterationCheckbox = page.locator('#inline-transliteration');
        await inlineTransliterationCheckbox.waitFor({ state: 'visible', timeout: 10000 });
        if (!(await inlineTransliterationCheckbox.isChecked())) {
          await inlineTransliterationCheckbox.locator('xpath=ancestor::label[1]').click();
        }

        await page.waitForTimeout(500); // Wait for settings to apply
      });

      // Get verse 2
      const verse = page.getByTestId(getVerseTestId('78:2'));
      await expect(verse).toBeVisible();

      // The translation and transliteration should be visible without hovering
      await expect(verse.getByText('the News', { exact: true })).toBeVisible();
      await expect(verse.getByText('l-naba-i', { exact: true })).toBeVisible();
    },
  );
});

test.describe('Word by Word Settings', () => {
  test(
    'Should hide translation and transliteration when disabled in settings',
    { tag: ['@reader', '@word-by-word'] },
    async ({ page }) => {
      await withSettingsDrawer(page, async () => {
        await setWordByWordTranslationEnabled(page, false);
        await setWordByWordTransliterationEnabled(page, false);
      });

      // Hover over the first word in verse 2
      const tooltip = await hoverFirstWordInVerse2(page);

      // Check that the tooltip does not contain the word by word translation or transliteration
      expect(tooltip).not.toContain('the News');
      expect(tooltip).not.toContain('l-naba-i');
    },
  );
});
