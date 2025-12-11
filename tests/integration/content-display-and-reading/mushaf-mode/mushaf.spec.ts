/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import QuranPage from '@/tests/POM/mushaf-mode';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

/**
 * Shared helper that runs the common mushaf page navigation assertions.
 * If `fontTestId` is provided it will open settings and select that font first.
 */
const runMushafPageTest = async (page, isMobile, fontTestId?: string) => {
  // Go to Surah 1
  await homePage.goTo('/1');

  // Set the font if provided
  if (fontTestId) {
    await homePage.openSettingsDrawer();
    await page.getByTestId(fontTestId).click();
    // Close settings drawer
    await page.keyboard.press('Escape');
  }

  // Enable mushaf mode
  const qp = new QuranPage(page);
  await qp.mushafMode(isMobile);

  // Now go to page 123
  await homePage.goTo('/page/123');

  // Verify that the page number is displayed correctly
  const pageInfo = page.getByTestId('page-info');
  await expect(pageInfo).toContainText('123');

  // The end of scrolling buttons should be visible
  const endOfScrollingControls = page.getByTestId('end-of-scrolling-controls');
  await expect(endOfScrollingControls).toBeVisible();

  // Previous page button should take us to page 122
  const previousPageButton = page.getByText('Previous Page');
  await previousPageButton.click();
  await expect(pageInfo).toContainText('122');

  // Next page button should take us to page 123
  const nextPageButton = page.getByText('Next Page');
  await nextPageButton.click();
  await expect(pageInfo).toContainText('123');
};

test.describe('IndoPak/Tajweed mushaf', () => {
  test(
    'Mushaf mode displays page number correctly (Uthmani - default)',
    { tag: ['@slow', '@mushaf', '@page', '@font'] },
    async ({ page, isMobile }) => {
      await runMushafPageTest(page, isMobile);
    },
  );

  test(
    'Mushaf mode displays page number correctly (Indopak)',
    { tag: ['@slow', '@mushaf', '@page', '@font'] },
    async ({ page, isMobile }) => {
      await runMushafPageTest(page, isMobile, 'text_indopak-button');
    },
  );

  test(
    'Mushaf mode displays page number correctly (Tajweed)',
    { tag: ['@slow', '@mushaf', '@page', '@font'] },
    async ({ page, isMobile }) => {
      await runMushafPageTest(page, isMobile, 'tajweed-button');
    },
  );

  test(
    'While on mushaf view, using the navigation drawer to navigate to another page works correctly',
    { tag: ['@slow', '@mushaf', '@page', '@navigation'] },
    async ({ page, isMobile }) => {
      // Go to Surah 1
      await homePage.goTo('/1');

      // Enable mushaf mode
      const qp = new QuranPage(page);
      await qp.mushafMode(isMobile);

      // Now go to page 123
      await homePage.goTo('/page/123');

      // Verify that the page number is displayed correctly
      const pageInfo = page.getByTestId('page-info');
      await expect(pageInfo).toContainText('123');

      const header = page.getByTestId('header');
      // Open the navigation drawer
      await header.getByText("5. Al-Ma'idah", { exact: true }).click();

      // Search for the buttom with text "Page"
      await page.getByTestId('page-button').click();

      // Click on page 137
      await page.getByText('Page 137', { exact: true }).click();

      // Verify that we are now on page 137
      await expect(pageInfo).toContainText('137');
    },
  );

  test(
    'Context Menu gets updated when switching font in mushaf mode',
    { tag: ['@slow', '@mushaf', '@page', '@font'] },
    async ({ page, isMobile }) => {
      // Go to Surah 1
      await homePage.goTo('/1');

      // Enable mushaf mode
      const qp = new QuranPage(page);
      await qp.mushafMode(isMobile);

      // Go to page 123
      await homePage.goTo('/page/123');

      // Page info should show "Hizb 13"
      const pageInfo = page.getByTestId('page-info');
      const contextMenu = page.getByTestId('header');
      await expect(pageInfo).toContainText('Hizb 13');
      await expect(contextMenu).toContainText("5. Al-Ma'idah");

      // Switch to IndoPak font
      await homePage.openSettingsDrawer();
      await page.getByTestId('text_indopak-button').click();
      // Close settings drawer
      await page.keyboard.press('Escape');

      // Page info should now show "Hizb 14" (IndoPak has 16 lines per page vs 15 for Uthmani)
      await expect(pageInfo).toContainText('Hizb 14');
      await expect(contextMenu).toContainText('Hizb 14');
      await expect(contextMenu).toContainText("6. Al-An'am");

      // Switch to Tajweed font
      await homePage.openSettingsDrawer();
      await page.getByTestId('tajweed-button').click();
      // Close settings drawer
      await page.keyboard.press('Escape');

      // Page info should still show "Hizb 13"
      await expect(pageInfo).toContainText('Hizb 13');
      await expect(contextMenu).toContainText("5. Al-Ma'idah");

      // Switch back to Uthmani font
      await homePage.openSettingsDrawer();
      await page.getByTestId('text_uthmani-button').click();
      await page.waitForTimeout(500);
      // Close settings drawer
      await page.keyboard.press('Escape');

      await page.waitForTimeout(500);

      // Page info should still show "Hizb 13"
      await expect(pageInfo).toContainText('Hizb 13');
      await expect(contextMenu).toContainText("5. Al-Ma'idah");
    },
  );
});
