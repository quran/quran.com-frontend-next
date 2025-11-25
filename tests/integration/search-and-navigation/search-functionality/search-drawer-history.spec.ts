/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test(
  'CTRL+K opens the search drawer',
  { tag: ['@fast', '@search', '@drawer', '@nav', '@shortcut'] },
  async ({ page, isMobile }) => {
    test.skip(isMobile, 'Skipping shortcut test on mobile devices');

    await page.waitForTimeout(1500);

    // 1. Press CTRL+K to open the search drawer
    await page.keyboard.press('Control+KeyK');

    // 2. Make sure the search drawer is visible
    const searchDrawer = page.getByTestId('search-drawer-container');
    await expect(searchDrawer).toBeVisible();
  },
);

test.describe('Search Drawer History', () => {
  test(
    'Search input is focused when opening the search drawer',
    { tag: ['@fast', '@search', '@drawer', '@nav'] },
    async ({ page }) => {
      // 1. Click on the search bar
      const searchBar = page.getByTestId('open-search-drawer');
      await searchBar.click();

      // 2. Make sure the search input is focused
      const searchDrawer = page.getByTestId('search-drawer-header');
      await expect(searchDrawer.getByPlaceholder('Search')).toBeFocused();
    },
  );

  test(
    'Search history is preserved between sessions',
    { tag: ['@slow', '@search', '@drawer', '@nav'] },
    async ({ page }) => {
      // 1. Click on the search icon in the navbar to open the search drawer
      const searchBar = page.getByTestId('open-search-drawer');
      await searchBar.click();

      // focus on the search input
      const searchDrawer = page.getByTestId('search-drawer-header');
      await searchDrawer.getByPlaceholder('Search').focus();

      // fill the current focused element (the search input) and wait for API response
      await Promise.all([
        page.keyboard.type('juz 30'),
        page.waitForResponse((response) => response.url().includes('/search')),
      ]);

      // 2. In the "search-results" div, we should see the "Juz 30" result
      const bodyContainer = page.getByTestId('search-drawer-container');

      await expect(bodyContainer.getByText('Juz 30')).toBeVisible();

      // 3. Click on the "Juz 30" result and check that we are navigated to /juz/30
      await bodyContainer.getByText('Juz 30').click();
      await expect(page).toHaveURL(/\/juz\/30$/);

      // 4. Redirect back to /
      await homePage.goTo();

      // 5. Click on the search bar again and make sure that we see "Juz 30" in the recent navigations
      await searchBar.click();
      await expect(page.getByTestId('search-drawer-container').getByText('Juz 30')).toBeVisible();
    },
  );
});
