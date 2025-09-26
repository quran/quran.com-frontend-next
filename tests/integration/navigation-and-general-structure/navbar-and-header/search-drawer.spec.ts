import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test(
  'Search drawer icon should open the search drawer when clicked',
  {
    tag: ['@navbar', '@settings', '@fast'],
  },
  async ({ page }) => {
    // Make sure the search drawer is not visible before opening it
    await expect(page.getByTestId('search-drawer-container')).not.toBeVisible();

    // Click to open the drawer
    await page.getByTestId('open-search-drawer').click();

    // Verify that the drawer is now visible
    await expect(page.getByTestId('search-drawer-container')).toBeVisible();
  },
);
