/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);

  await homePage.goTo('/1');
});

test(
  'The reciter list should be scrollable on small heights device',
  { tag: ['@reciter', '@reading', '@audio'] },
  async ({ page, isMobile }) => {
    // If it's desktop, set the viewport height to a small value to force scrolling
    if (!isMobile) {
      await page.setViewportSize({ width: 1280, height: 400 });
    }

    // Find and click the reciter selection button
    const playVerseButton = page.locator('#play-verse-button').first();
    await playVerseButton.waitFor({ state: 'visible' });
    await playVerseButton.click();

    const overflowMenuTrigger = page.locator('#audio-player-overflow-menu-trigger');
    await expect(overflowMenuTrigger).toBeVisible();

    // Wait for the button to be clickable
    await expect(async () => {
      await overflowMenuTrigger.click({ trial: true });
    }).toPass({ timeout: 5000 });

    await overflowMenuTrigger.click();

    const reciterMenuItem = page.locator('#audio-player-overflow-menu-reciter');
    await expect(reciterMenuItem).toBeVisible();
    await reciterMenuItem.click();

    const reciterList = page.locator('#audio-player-reciter-list');
    await expect(reciterList).toBeVisible();

    const reciterItems = reciterList.locator('[role="menuitem"]');
    await expect(reciterItems.first()).toBeVisible();

    // Ensure the reciter list is scrollable
    const scrollMetrics = await reciterList.evaluate((element) => ({
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      overflowY: window.getComputedStyle(element).overflowY,
    }));

    // The scrollHeight should be greater than clientHeight for scrolling to be possible
    expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
    expect(['auto', 'scroll']).toContain(scrollMetrics.overflowY);

    const recitersCount = await reciterItems.count();
    expect(recitersCount).toBeGreaterThan(0);

    // Ensure first reciter is clickable
    const firstReciter = reciterItems.first();
    await firstReciter.click();
    await expect(firstReciter.locator('svg')).toBeVisible();
  },
);
