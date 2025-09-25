import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/search');
});

test('Search for a juz is working', async ({ page }) => {
  // 1. Click on the search bar (#searchQuery)
  const searchBar = page.locator('#searchQuery');
  await searchBar.fill('juz 30');

  // 2. In the "search-results" div, we should see the "Juz 30" result
  const searchResults = page.getByTestId('search-results');
  await expect(searchResults.getByText('Juz 30')).toBeVisible();

  // 3. Click on the "Juz 30" result and check that we are navigated to /juz/30
  await Promise.all([searchResults.getByText('Juz 30').click(), page.waitForURL('/juz/30')]);
});

test('Popular searches are displayed', async ({ page }) => {
  // 1. Make sure we see the popular searches section
  const popularSearchesSection = page.getByTestId('popular-search-section');
  await expect(popularSearchesSection).toBeVisible();

  // 2. Make sure there's at least one popular search (one children to the popular searches section)
  const itemCount = await popularSearchesSection.count();
  expect(itemCount).toBeGreaterThanOrEqual(1);
});

test('Searching for a non-result displays the no results message', async ({ page }) => {
  // 1. Click on the search bar (#searchQuery)
  await homePage.goTo('/search?page=1&query=abcd');

  // 2. We should see the "No results found" message
  const searchResults = page.getByTestId('search-body-container');
  await expect(searchResults.getByText('No results found')).toBeVisible();
});
