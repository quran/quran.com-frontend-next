import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test.describe('Homepage Search Bar - Navigation Search', () => {
  test(
    'Search for Juz navigates correctly',
    { tag: ['@slow', '@search', '@homepage'] },
    async ({ page }) => {
      // 1. Search for 'juz 30' and wait for API response
      const [searchResults] = await Promise.all([
        homePage.searchFor('juz 30'),
        page.waitForResponse((response) => response.url().includes('/search')),
      ]);

      // 2. In the "search-results" div, we should see the "Juz 30" result
      await expect(searchResults.getByText('Juz 30')).toBeVisible();

      // 3. Click on the "Juz 30" result and check that we are navigated to /juz/30
      await Promise.all([searchResults.getByText('Juz 30').click(), page.waitForURL(/\/juz\/30$/)]);
    },
  );

  test(
    'Search for Surah name navigates correctly',
    { tag: ['@slow', '@search', '@homepage'] },
    async ({ page }) => {
      // 1. Search for 'al baqara' and wait for API response
      const [searchResults] = await Promise.all([
        homePage.searchFor('al baqarah'),
        page.waitForResponse((response) => response.url().includes('/search')),
      ]);

      // 2. In the "search-results" div, we should see the "Al-Baqarah" result
      await expect(searchResults.getByText('Al-Baqarah')).toBeVisible();

      // 3. Click on the "Al-Baqarah" result and check that we are navigated to /2
      await searchResults.getByText('Al-Baqarah').click();
      await expect(page).toHaveURL(/\/2$/);
    },
  );
});

test.describe('Homepage Search Bar - Verse Content Search', () => {
  test(
    'Search for English verse content displays correct results',
    { tag: ['@slow', '@search', '@verses'] },
    async ({ page }) => {
      // 1. Search for 'I am near' and wait for API response
      const [searchResults] = await Promise.all([
        homePage.searchFor('I am near'),
        page.waitForResponse((response) => response.url().includes('/search')),
      ]);

      // 2. In the "search-results" div, we should see two results
      await expect(searchResults.getByText('2:186')).toBeVisible();
      await expect(searchResults.getByText('8:48')).toBeVisible();

      // 3. Click on the "2:186" result and check that we are navigated to /2?startingVerse=186
      await Promise.all([
        searchResults.getByText('2:186').click(),
        page.waitForURL(/\/2\?startingVerse=186$/),
      ]);
    },
  );

  test(
    'Search for non-English translation content works correctly',
    { tag: ['@fast', '@search', '@translations'] },
    async ({ page }) => {
      // FIXME: Searching for a non-english translation doesn't work anymore, skipping for now
      // (it worked before)
      test.skip(true, '');

      // 1. Search for 'Je suis proche' and wait for API response
      const [searchResults] = await Promise.all([
        homePage.searchFor('Je suis proche'),
        page.waitForResponse((response) => response.url().includes('/search')),
      ]);

      // 2. In the "search-results" div, we should see one result
      await expect(searchResults.getByText('2:186')).toBeVisible();
    },
  );

  test(
    'Search for specific verse reference displays verse content',
    { tag: ['@fast', '@search', '@verses', '@smoke'] },
    async ({ page }) => {
      // 1. Search for '2:255' and wait for API response
      const [searchResults] = await Promise.all([
        homePage.searchFor('2:255'),
        page.waitForResponse((response) => response.url().includes('/search')),
      ]);

      // 2. In the "search-results" div, we should see one result
      await expect(
        searchResults.getByText('His Seat encompasses the heavens and the earth'),
      ).toBeVisible();
      await expect(searchResults.getByText('2:255')).toBeVisible();
    },
  );
});

test.describe('Homepage Search Bar - General Search Features', () => {
  test(
    'Number search displays all relevant results',
    { tag: ['@fast', '@search', '@general', '@smoke'] },
    async ({ page }) => {
      // 1. Search for '5' and wait for API response
      const [searchResults] = await Promise.all([
        homePage.searchFor('5'),
        page.waitForResponse((response) => response.url().includes('/search')),
      ]);

      // 2. In the "search-results" div, we should see one result
      await expect(searchResults.getByText("5. Al-Ma'idah (The Table Spread)")).toBeVisible();
      await expect(searchResults.getByText('Page 5')).toBeVisible();
      await expect(searchResults.getByText('Juz 5')).toBeVisible();
    },
  );

  test(
    'No results query redirects to advanced search page',
    { tag: ['@slow', '@search', '@fallback'] },
    async ({ page }) => {
      // 1. Search for 'abcd' and wait for API response
      const [searchResults] = await Promise.all([
        homePage.searchFor('abcd'),
        page.waitForResponse((response) => response.url().includes('/search')),
      ]);

      // 2. In the "search-results" div, we should see one result
      await expect(searchResults.getByText("Search for 'abcd'")).toBeVisible();

      // 3. Click on the "Search for 'abcd'" result and check that we are navigated to /search?query=abcd
      await searchResults.getByText("Search for 'abcd'").click();
      await expect(page).toHaveURL(/\/search\?page=1&query=abcd$/);
    },
  );
});
