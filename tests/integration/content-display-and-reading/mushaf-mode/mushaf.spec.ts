import { test, expect, type Page } from '@playwright/test';

import { selectQuranFont, withSettingsDrawer } from '@/tests/helpers/settings';
import Homepage from '@/tests/POM/home-page';
import QuranPage from '@/tests/POM/mushaf-mode';
import { TestId, type SettingsQuranFont } from '@/tests/test-ids';
import { QuranFont } from '@/types/QuranReader';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

/**
 * Shared helper that runs the common mushaf page navigation assertions.
 * If `fontTestId` is provided it will open settings and select that font first.
 */
const runMushafPageTest = async (
  page: Page,
  isMobile: boolean,
  font?: SettingsQuranFont,
): Promise<void> => {
  // Go to Surah 1
  await homePage.goTo('/1');

  // Set the font if provided
  if (font) {
    await withSettingsDrawer(page, async () => {
      await selectQuranFont(page, font);
    });
  }

  // Enable mushaf mode
  const qp = new QuranPage(page);
  await qp.mushafMode(isMobile);

  // Now go to page 123
  await homePage.goTo('/page/123');

  // Verify that the page number is displayed correctly
  const pageInfo = page.getByTestId(TestId.PAGE_INFO);
  await expect(pageInfo).toContainText('123');

  // The end of scrolling buttons should be visible
  const endOfScrollingControls = page.getByTestId(TestId.END_OF_SCROLLING_CONTROLS);
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

// TODO: unskip when PR about QF-1129 is merged
test.describe.skip('temporarily disabled', () => {
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
      await runMushafPageTest(page, isMobile, QuranFont.IndoPak);
    },
  );

  test(
    'Mushaf mode displays page number correctly (Tajweed)',
    { tag: ['@slow', '@mushaf', '@page', '@font'] },
    async ({ page, isMobile }) => {
      await runMushafPageTest(page, isMobile, QuranFont.Tajweed);
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
      const pageInfo = page.getByTestId(TestId.PAGE_INFO);
      await expect(pageInfo).toContainText('123');

      const header = page.getByTestId(TestId.HEADER);
      // Open the navigation drawer
      await header.getByText("5. Al-Ma'idah", { exact: true }).click();

      // Search for the buttom with text "Page"
      await page.getByTestId(TestId.PAGE_BUTTON).click();

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
      const pageInfo = page.getByTestId(TestId.PAGE_INFO);
      const contextMenu = page.getByTestId(TestId.HEADER);
      await expect(pageInfo).toContainText('Hizb 13');
      await expect(contextMenu).toContainText("5. Al-Ma'idah");

      // Switch to IndoPak font
      await withSettingsDrawer(page, async () => {
        await selectQuranFont(page, QuranFont.IndoPak);
      });

      // Page info should now show "Hizb 14" (IndoPak has 16 lines per page vs 15 for Uthmani)
      await expect(pageInfo).toContainText('Hizb 14');
      await expect(contextMenu).toContainText('Hizb 14');
      await expect(contextMenu).toContainText("6. Al-An'am");

      // Switch to Tajweed font
      await withSettingsDrawer(page, async () => {
        await selectQuranFont(page, QuranFont.Tajweed);
      });

      // Page info should still show "Hizb 13"
      await expect(pageInfo).toContainText('Hizb 13');
      await expect(contextMenu).toContainText("5. Al-Ma'idah");

      // Switch back to Uthmani font
      await withSettingsDrawer(page, async () => {
        await selectQuranFont(page, QuranFont.Uthmani);
      });

      // Page info should still show "Hizb 13"
      await expect(pageInfo).toContainText('Hizb 13');
      await expect(contextMenu).toContainText("5. Al-Ma'idah");
    },
  );
});
