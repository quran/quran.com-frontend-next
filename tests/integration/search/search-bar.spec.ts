import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Hide the nextjs error overlay to be able to click on elements behind it
  await page.addStyleTag({
    content: `
        nextjs-portal {
            display: none;
        }
        `,
  });
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

test('Search for a surah is working', async ({ page }) => {
  // 1. Click on the search bar (#searchQuery)
  const searchBar = page.locator('#searchQuery');
  await searchBar.fill('al baqara');

  // 2. In the "search-results" div, we should see the "Al-Baqarah" result
  const searchResults = page.getByTestId('search-results');
  await expect(searchResults.getByText('Al-Baqarah')).toBeVisible();

  // 3. Click on the "Al-Baqarah" result and check that we are navigated to /2
  await Promise.all([searchResults.getByText('Al-Baqarah').click(), page.waitForURL('/2')]);
});

test('Search for the content of a verse is working', async ({ page }) => {
  // 1. Click on the search bar (#searchQuery)
  const searchBar = page.locator('#searchQuery');
  await searchBar.fill('I am near');

  // 2. In the "search-results" div, we should see two results
  const searchResults = page.getByTestId('search-results');
  await expect(searchResults.getByText('2:186')).toBeVisible();
  await expect(searchResults.getByText('8:48')).toBeVisible();

  // 3. Click on the "2:186" result and check that we are navigated to /2?startingVerse=186
  await Promise.all([
    searchResults.getByText('2:186').click(),
    page.waitForURL('/2?startingVerse=186'),
  ]);
});

test('Search for a non-english translation is working', async ({ page }) => {
  // 1. Click on the search bar (#searchQuery)
  const searchBar = page.locator('#searchQuery');
  await searchBar.fill('Je suis proche');

  // 2. In the "search-results" div, we should see one result
  const searchResults = page.getByTestId('search-results');
  await expect(searchResults.getByText('2:186')).toBeVisible();
});

test('Searching for a specific verse is working', async ({ page }) => {
  // 1. Click on the search bar (#searchQuery)
  const searchBar = page.locator('#searchQuery');
  await searchBar.fill('2:255');

  // 2. In the "search-results" div, we should see one result
  const searchResults = page.getByTestId('search-results');
  await expect(
    searchResults.getByText('His Seat encompasses the heavens and the earth'),
  ).toBeVisible();
  await expect(searchResults.getByText('2:255')).toBeVisible();
});

test('Searching for a number displays the correct results', async ({ page }) => {
  // 1. Click on the search bar (#searchQuery)
  const searchBar = page.locator('#searchQuery');
  await searchBar.fill('5');

  // 2. In the "search-results" div, we should see one result
  const searchResults = page.getByTestId('search-results');
  await expect(searchResults.getByText("Surah Al-Ma'idah")).toBeVisible();
  await expect(searchResults.getByText('Page 5')).toBeVisible();
  await expect(searchResults.getByText('Juz 5')).toBeVisible();
});

test('Searching for a no-result query displays a link to advanced search', async ({ page }) => {
  // 1. Click on the search bar (#searchQuery)
  const searchBar = page.locator('#searchQuery');
  await searchBar.fill('abcd');

  // 2. In the "search-results" div, we should see one result
  const searchResults = page.getByTestId('search-results');
  await expect(searchResults.getByText("Search for 'abcd'")).toBeVisible();

  // 3. Click on the "Search for 'abcd'" result and check that we are navigated to /search?query=abcd
  await Promise.all([
    searchResults.getByText("Search for 'abcd'").click(),
    page.waitForURL('/search?page=1&query=abcd'),
  ]);
});
