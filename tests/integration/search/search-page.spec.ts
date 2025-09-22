import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/search', { waitUntil: 'networkidle' });

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
  await page.goto('/search?page=1&query=abcd', { waitUntil: 'networkidle' });
  await page.addStyleTag({
    content: `
        nextjs-portal {
            display: none;
        }
        `,
  });

  // 2. We should see the "No results found" message
  const searchResults = page.getByTestId('search-body-container');
  await expect(searchResults.getByText('No results found')).toBeVisible();
});
