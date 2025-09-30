import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/78');
});

test(
  'Word by word view displays correctly',
  { tag: ['@slow', '@reader', '@word-by-word'] },
  async ({ page }) => {
    // Get verse 2
    const verse = page.getByTestId('verse-78:2');
    await expect(verse).toBeVisible();

    // Click on the more button
    const moreButton = verse.getByLabel('More');
    await expect(moreButton).toBeVisible();
    await moreButton.click();

    // Click on the role="menuitem" with text "Word By Word"
    const wordByWordButton = page.getByRole('menuitem', { name: 'Word By Word' });
    await expect(wordByWordButton).toBeVisible();
    await wordByWordButton.click();

    // Check that the modal is open
    const modal = page.getByTestId('wbw-verse-modal-content');
    await expect(modal).toBeVisible();

    // Check that the modal contains the word by word translation and transliteration
    await expect(modal.getByText('About', { exact: true })).toBeVisible();
    await expect(modal.getByText('the News', { exact: true })).toBeVisible();
    await expect(modal.getByText('the Great', { exact: true })).toBeVisible();
    await expect(modal.getByText('ʿani', { exact: true })).toBeVisible();
    await expect(modal.getByText('l-naba-i', { exact: true })).toBeVisible();
    await expect(modal.getByText('l-ʿaẓīmi', { exact: true })).toBeVisible();
  },
);
