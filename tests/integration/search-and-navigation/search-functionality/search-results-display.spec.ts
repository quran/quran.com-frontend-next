/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

const HAR_QUERY = 'har';

test.describe('Search result regressions', () => {
  let homePage: Homepage;

  test.beforeEach(async ({ page, context }) => {
    homePage = new Homepage(page, context);
    await homePage.goTo('/');
  });

  test('homepage search results show bilingual Quran entries for har', async ({ page }) => {
    const searchResponse = page.waitForResponse((response) => response.url().includes('/search'));
    const dropdown = await homePage.searchFor(HAR_QUERY);
    await searchResponse;

    await expect(dropdown).toBeVisible();
    await expect(dropdown.getByText('108. Al-Kawthar (The Abundance)')).toBeVisible();
    await expect(dropdown.getByText('And invoke not besides Allâh')).toBeVisible();
    await expect(dropdown.getByText('وَلَا تَدْعُ مِن دُونِ ٱللَّهِ')).toBeVisible();
    await expect(dropdown.getByText('(Yunus 10:106)')).toBeVisible();
    await expect(dropdown.getByText('(يونس ١٠:١٠٦)')).toBeVisible();
  });

  test('search drawer keeps bilingual layout for har', async ({ page }) => {
    await page.getByTestId('open-search-drawer').click();

    const drawerInput = page.getByTestId('search-drawer-header').locator('input');
    const searchResponse = page.waitForResponse((response) => response.url().includes('/search'));
    await drawerInput.fill(HAR_QUERY);
    await searchResponse;

    const drawerResults = page.getByTestId('search-drawer');
    await expect(drawerResults).toBeVisible();
    await expect(drawerResults.getByText('108. Al-Kawthar (The Abundance)')).toBeVisible();
    await expect(drawerResults.getByText('And invoke not besides Allâh')).toBeVisible();
    await expect(drawerResults.getByText('وَلَا تَدْعُ مِن دُونِ ٱللَّهِ')).toBeVisible();
    await expect(drawerResults.getByText('(Yunus 10:106)')).toBeVisible();
    await expect(drawerResults.getByText('(يونس ١٠:١٠٦)')).toBeVisible();
  });

  test('dedicated search page renders bilingual results for har', async ({ page }) => {
    const searchResponse = page.waitForResponse((response) => response.url().includes('/search'));
    await homePage.goTo('/search?query=har');
    await searchResponse;

    const searchResults = page.getByTestId('search-drawer-container');
    await expect(searchResults).toBeVisible();
    await expect(searchResults.getByText('108. Al-Kawthar (The Abundance)')).toBeVisible();
    await expect(
      searchResults.getByText('And Allah has made your homes a place to rest'),
    ).toBeVisible();
    await expect(
      searchResults.getByText('وَٱللَّهُ جَعَلَ لَكُم مِّنۢ بُيُوتِكُمْ سَكَنًا'),
    ).toBeVisible();
    await expect(searchResults.getByText('(An-Nahl 16:80)')).toBeVisible();
    await expect(searchResults.getByText('(النحل ١٦:٨٠)')).toBeVisible();
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
