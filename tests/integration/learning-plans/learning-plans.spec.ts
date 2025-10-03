import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/learning-plans');
});

test('Learning Plans are displayed correctly and navigate to the correct URL', async ({ page }) => {
  const learningPlansSection = page.getByTestId('courses-list');
  await expect(learningPlansSection).toBeVisible();

  // Check that there are at least 3 items in the Learning Plans section
  const items = learningPlansSection.getByRole('link');
  expect(await items.count()).toBeGreaterThanOrEqual(3);

  // Click on the first item
  const firstItem = items.first();
  const firstItemTitle = await firstItem.textContent();
  expect(firstItemTitle).toBeTruthy();
  await firstItem.click();

  // Verify that we navigated to a URL that contains /learning-plans/
  await page.waitForURL(/\/learning-plans\//);
  await expect(page).toHaveURL(/\/learning-plans\/.*/);
});
