import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test.describe('Search Drawer History', () => {
  test(
    'Search input is focused when opening the search drawer',
    { tag: ['@fast', '@search', '@drawer', '@nav'] },
    async ({ page }) => {
      // 1. Click on the search bar
      const searchBar = page.getByTestId('open-search-drawer');
      await searchBar.click();

      // 2. Make sure the search input is focused
      const searchDrawer = page.getByTestId('search-drawer-container');
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
      const searchDrawer = page.getByTestId('search-drawer-container');
      await searchDrawer.getByPlaceholder('Search').focus();

      // fill the current focused element (the search input)
      await page.keyboard.type('juz 30');

      // 2. In the "search-results" div, we should see the "Juz 30" result
      const bodyContainer = page.getByTestId('search-body-container');

      await expect(bodyContainer.getByText('Juz 30')).toBeVisible();

      // 3. Click on the "Juz 30" result and check that we are navigated to /juz/30
      await bodyContainer.getByText('Juz 30').click();
      await expect(page).toHaveURL(/\/juz\/30$/);

      // 4. Redirect back to /
      await homePage.goTo();

      // 5. Click on the search bar again and make sure that we see "Juz 30" in the recent navigations
      await searchBar.click();
      await expect(page.getByTestId('search-body-container').getByText('Juz 30')).toBeVisible();
    },
  );
});
