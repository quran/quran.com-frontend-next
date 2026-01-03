import { test, expect } from '@playwright/test';

import { openSearchDrawer } from '@/tests/helpers/navigation';
import Homepage from '@/tests/POM/home-page';
import { getChapterContainerTestId, TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  test.slow();

  homePage = new Homepage(page, context);
});

test(
  'Navigating using back button works',
  { tag: ['@url', '@slow', '@navigation'] },
  async ({ page }) => {
    // TODO: unskip this when https://github.com/quran/quran.com-frontend-next/pull/2515 is merged
    test.skip(true, 'Unskip when #2515 is merged');

    await homePage.goTo('/');
    await page.getByTestId(getChapterContainerTestId(1)).click();
    await expect(page).toHaveURL(/\/1$/);
    await openSearchDrawer(page);
    await page.keyboard.type('light');
    await expect(page.getByTestId(TestId.MORE_RESULTS)).toBeVisible();
    await page.getByTestId(TestId.MORE_RESULTS).click();
    await expect(page).toHaveURL(/search\?page=1&query=light/);
    await page.getByTestId(TestId.NEXT_PAGE_BUTTON).click();
    await expect(page).toHaveURL(/search\?page=2&query=light/);

    const navigationButtons = page.getByTestId(TestId.PAGE_NAVIGATION_BUTTONS);
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
    // TODO: unskip this when https://github.com/quran/quran.com-frontend-next/pull/2515 is merged
    test.skip(true, 'Unskip when #2515 is merged');

    await homePage.goTo('/');
    await page.getByTestId(getChapterContainerTestId(1)).click();
    await expect(page).toHaveURL(/\/1$/);
    await openSearchDrawer(page);
    await page.keyboard.type('light');
    await expect(page.getByTestId(TestId.MORE_RESULTS)).toBeVisible();
    await page.getByTestId(TestId.MORE_RESULTS).click();
    await expect(page).toHaveURL(/search\?page=1&query=light/);
    await page.getByTestId(TestId.NEXT_PAGE_BUTTON).click();
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
