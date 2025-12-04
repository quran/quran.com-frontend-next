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
      await page.waitForTimeout(1500);
      await page.mouse.wheel(0, 150);
      await page.waitForSelector('[data-testid="progress-bar"]', { state: 'visible' });
    }

    const initialProgress = await progressBar.getAttribute('data-progress');

    // Scroll a bit
    for (let i = 0; i < 5; i += 1) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(500);
    }

    // The progress bar should be > initial progress
    await expect
      .poll(async () => Number(await progressBar.getAttribute('data-progress')))
      .toBeGreaterThan(Number(initialProgress));
  },
);
