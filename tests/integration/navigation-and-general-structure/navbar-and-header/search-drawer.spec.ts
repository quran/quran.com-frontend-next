import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test(
  'Search drawer icon should open the search drawer when clicked',
  {
    tag: ['@navbar', '@search', '@fast', '@smoke'],
  },
  async ({ page }) => {
    // Make sure the search drawer is not visible before opening it
    await expect(page.getByTestId('search-drawer-container')).not.toBeVisible();

    // Click to open the drawer
    await page.getByTestId('open-search-drawer').click();

    // Verify that the drawer is now visible
    await expect(page.getByTestId('search-drawer-container')).toBeVisible();

    // Verify that the search input is focused
    const searchInput = page.getByPlaceholder('Search', { exact: true });
    await expect(searchInput).toBeFocused();
  },
);

test(
  'Escape key should close the search drawer when it is open (desktop only)',
  {
    tag: ['@navbar', '@search'],
  },
  async ({ page, isMobile }) => {
    test.skip(isMobile, "This test is not applicable for mobile as there's no Escape key");

    // Open the search drawer first
    await page.getByTestId('open-search-drawer').click();
    await expect(page.getByTestId('search-drawer-container')).toBeVisible();

    // Press the Escape key to close the drawer
    await page.keyboard.press('Escape');

    // Verify that the drawer is no longer visible
    await expect(page.getByTestId('search-drawer-container')).not.toBeVisible();
  },
);

test(
  'Clicking outside the search drawer should close it (desktop only)',
  {
    tag: ['@navbar', '@search'],
  },
  async ({ page, isMobile }) => {
    test.skip(
      isMobile,
      'This test is skipped on mobile as the drawer takes the full screen, so clicking outside is not possible.',
    );

    // Open the search drawer first
    await page.getByTestId('open-search-drawer').click();
    await expect(page.getByTestId('search-drawer-container')).toBeVisible();

    // Click outside the drawer
    await page.click('body');

    // Verify that the drawer is no longer visible
    await expect(page.getByTestId('search-drawer-container')).not.toBeVisible();
  },
);
