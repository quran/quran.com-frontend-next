/* eslint-disable no-await-in-loop */
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
  async ({ page, isMobile }) => {
    const progressBar = page.getByTestId('progress-bar');

    if (isMobile) {
      // The progress bar is not shown on mobile unless we scroll a bit
      await page.mouse.wheel(0, 100);
      await page.waitForSelector('[data-testid="progress-bar"]', { state: 'visible' });
    }

    const initialProgress = await progressBar.getAttribute('data-progress');

    // Scroll a bit
    for (let i = 0; i < 5; i += 1) {
      await page.mouse.wheel(0, 500);
      // Wait for progress to update after scroll
      await page.waitForTimeout(200);
    }

    // The progress bar should be > initial progress
    const updatedProgress = await progressBar.getAttribute('data-progress');
    expect(Number(updatedProgress)).toBeGreaterThan(Number(initialProgress));
  },
);
