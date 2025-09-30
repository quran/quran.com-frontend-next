import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/78');
});

test(
  'Progress bar indicator increase when scrolling down',
  { tag: ['@slow', '@reader', '@progress'] },
  async ({ page }) => {
    const progressBar = page.getByTestId('progress-bar');

    const initialProgress = await progressBar.getAttribute('data-progress');

    // Scroll until the bottom of the page
    await page.mouse.wheel(0, 5000);
    await page.waitForTimeout(1000); // wait for the progress bar to update

    // The progress bar should be > initial progress
    const updatedProgress = await progressBar.getAttribute('data-progress');
    expect(Number(updatedProgress)).toBeGreaterThan(Number(initialProgress));
  },
);
