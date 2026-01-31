/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

// note: the external API used for search suggestions can change and thus
// gives different results over time.
const SEARCH_QUERY = 'kawthar';

test.describe('Search result regressions', () => {
  let homePage: Homepage;

  test.beforeEach(async ({ page, context }) => {
    homePage = new Homepage(page, context);
    await homePage.goTo('/');
  });

  test('homepage search results show bilingual Quran entries for har', async ({ page }) => {
    const searchResponse = page.waitForResponse((response) => response.url().includes('/search'));
    const dropdown = await homePage.searchFor(SEARCH_QUERY);
    await searchResponse;

    await expect(dropdown).toBeVisible();
    await expect(dropdown.getByText('108. Al-Kawthar (The Abundance)')).toBeVisible();
    await expect(dropdown.getByText('We have granted you')).toBeVisible();
    await expect(dropdown.getByText('إِنَّآ أَعْطَيْنَـٰكَ ٱلْكَوْثَرَ ')).toBeVisible();
    await expect(dropdown.getByText('(Al-Kawthar 108:1)')).toBeVisible();
    await expect(dropdown.getByText('(الكوثر ١٠٨:١)')).toBeVisible();
  });

  test('search drawer keeps bilingual layout for har', async ({ page }) => {
    await page.getByTestId('open-search-drawer').click();

    const drawerInput = page.getByTestId('search-drawer-header').locator('input');
    const searchResponse = page.waitForResponse((response) => response.url().includes('/search'));
    await drawerInput.fill(SEARCH_QUERY);
    await searchResponse;

    const drawerResults = page.getByTestId('search-drawer');
    await expect(drawerResults).toBeVisible();
    await expect(drawerResults.getByText('108. Al-Kawthar (The Abundance)')).toBeVisible();
    await expect(drawerResults.getByText('We have granted you')).toBeVisible();
    await expect(drawerResults.getByText('إِنَّآ أَعْطَيْنَـٰكَ ٱلْكَوْثَرَ ')).toBeVisible();
    await expect(drawerResults.getByText('(Al-Kawthar 108:1)')).toBeVisible();
    await expect(drawerResults.getByText('(الكوثر ١٠٨:١)')).toBeVisible();
  });

  test('dedicated search page renders bilingual results for har', async ({ page }) => {
    const searchResponse = page.waitForResponse((response) => response.url().includes('/search'));
    await homePage.goTo(`/search?query=${SEARCH_QUERY}`);
    await searchResponse;

    const searchResults = page.getByTestId('search-drawer-container');
    await expect(searchResults).toBeVisible();
    await expect(searchResults.getByText('108. Al-Kawthar (The Abundance)')).toBeVisible();
    await expect(searchResults.getByText('We have granted you')).toBeVisible();
    await expect(searchResults.getByText('إِنَّآ أَعْطَيْنَـٰكَ ٱلْكَوْثَرَ ')).toBeVisible();
    await expect(searchResults.getByText('(Al-Kawthar 108:1)')).toBeVisible();
    await expect(searchResults.getByText('(الكوثر ١٠٨:١)')).toBeVisible();
  });

  test('searching for a page displays correct result', async ({ page }) => {
    const searchResponse = page.waitForResponse((response) => response.url().includes('/search'));
    await homePage.goTo('/search?query=page 255');
    await searchResponse;

    const searchResults = page.getByTestId('search-drawer-container');
    await expect(searchResults).toBeVisible();
    const pageResult = searchResults.getByText('Page 255');
    await expect(pageResult).toBeVisible();
    await pageResult.click();
    await expect(page).toHaveURL(/\/page\/255$/);
  });

  test('searching for an arabic word displays correct result', async ({ page }) => {
    const searchResponse = page.waitForResponse((response) => response.url().includes('/search'));
    await homePage.goTo('/search?query=لَقَدْ');
    await searchResponse;

    const searchResults = page.getByTestId('search-drawer-container');
    await expect(searchResults).toBeVisible();
    const pageResult = searchResults.getByText('لَتَعْلَمُ مَا نُرِيدُ (Hud 11:79)');
    await expect(pageResult).toBeVisible();
  });
});
