import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  test.slow();

  homePage = new Homepage(page, context);
});

test(
  'Navigating using back button works',
  { tag: ['@url', '@slow', '@navigation'] },
  async ({ page }) => {
    await homePage.goTo('/');
    await page.getByTestId('chapter-1-container').click();
    await expect(page).toHaveURL(/\/1$/);
    await page.getByTestId('open-search-drawer').click();
    await page.keyboard.type('light');
    await expect(page.getByTestId('more-results')).toBeVisible();
    await page.getByTestId('more-results').click();
    await expect(page).toHaveURL(/search\?page=1&query=light/);
    await page.getByTestId('next-page-button').click();
    await expect(page).toHaveURL(/search\?page=2&query=light/);

    const navigationButtons = page.getByTestId('page-navigation-buttons');
    await expect(navigationButtons).toBeVisible();
    await navigationButtons.getByText('4').click();
    await expect(page).toHaveURL(/search\?page=4&query=light/);

    // go back
    await page.goBack();
    await expect(page).toHaveURL(/search\?page=2&query=light/);
    await page.goBack();
    await expect(page).toHaveURL(/search\?page=1&query=light/);
    await page.goBack();
    await expect(page).toHaveURL(/\/1$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  },
);

test(
  'Navigating using forward button works',
  { tag: ['@url', '@slow', '@navigation'] },
  async ({ page }) => {
    await homePage.goTo('/');
    await page.getByTestId('chapter-1-container').click();
    await expect(page).toHaveURL(/\/1$/);
    await page.getByTestId('open-search-drawer').click();
    await page.keyboard.type('light');
    await expect(page.getByTestId('more-results')).toBeVisible();
    await page.getByTestId('more-results').click();
    await expect(page).toHaveURL(/search\?page=1&query=light/);
    await page.getByTestId('next-page-button').click();
    await expect(page).toHaveURL(/search\?page=2&query=light/);

    await page.goBack();
    await expect(page).toHaveURL(/search\?page=1&query=light/);
    await page.goBack();
    await expect(page).toHaveURL(/\/1$/);

    await page.goForward();
    await expect(page).toHaveURL(/search\?page=1&query=light/);
    await page.goForward();
    await expect(page).toHaveURL(/search\?page=2&query=light/);
  },
);
