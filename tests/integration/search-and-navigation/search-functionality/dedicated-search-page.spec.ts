import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/search');
});

// eslint-disable-next-line react-func/max-lines-per-function
test.describe('Dedicated Search Page', () => {
  test(
    'Search for Juz from dedicated search page works correctly',
    { tag: ['@slow', '@search', '@page'] },
    async ({ page }) => {
      // 1. Click on the search bar (#searchQuery)
      const searchBar = page.locator('#searchQuery');
      await searchBar.fill('juz 30');

      // 2. In the "search-results" div, we should see the "Juz 30" result
      const searchResults = page.getByTestId('search-results');
      await expect(searchResults.getByText('Juz 30')).toBeVisible();

      // 3. Click on the "Juz 30" result and check that we are navigated to /juz/30
      await Promise.all([searchResults.getByText('Juz 30').click(), page.waitForURL('/juz/30')]);
    },
  );

  test(
    'Popular searches section is displayed correctly',
    { tag: ['@fast', '@search', '@page'] },
    async ({ page }) => {
      // 1. Make sure we see the popular searches section
      const popularSearchesSection = page.getByTestId('popular-search-section');
      await expect(popularSearchesSection).toBeVisible();

      // 2. Make sure there's at least one popular search (one children to the popular searches section)
      const popularItems = popularSearchesSection.locator('li, a');
      const itemCount = await popularItems.count();
      expect(itemCount).toBeGreaterThan(0);
    },
  );

  test(
    'No results message is displayed for invalid searches',
    { tag: ['@fast', '@search', '@page'] },
    async ({ page }) => {
      // Search for a random string that should yield no results
      await homePage.goTo('/search?page=1&query=abcd');

      // We should see the "No results found" message
      const searchResults = page.getByTestId('search-body-container');
      await expect(searchResults.getByText('No results found')).toBeVisible();
    },
  );

  test(
    'Searching for "ayatul kursi" displays 2:255 in results',
    { tag: ['@fast', '@search', '@page'] },
    async ({ page }) => {
      // 1. Click on the search bar (#searchQuery)
      const searchBar = page.locator('#searchQuery');
      await searchBar.fill('ayatul kursi');
      // press enter to trigger the search
      await searchBar.press('Enter');

      // 2. In the "search-body-container" div, we should see the "2:255" result
      const searchResults = page.getByTestId('search-body-container');
      await expect(searchResults.getByText('2:255')).toBeVisible();
    },
  );
});
