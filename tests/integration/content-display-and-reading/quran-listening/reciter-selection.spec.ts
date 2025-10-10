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
    if (!isMobile) {
      await page.setViewportSize({ width: 1280, height: 400 });
    }

    const playVerseButton = page.locator('#play-verse-button').first();
    await playVerseButton.waitFor({ state: 'visible' });
    await playVerseButton.click();

    const overflowMenuTrigger = page.locator('#audio-player-overflow-menu-trigger');
    await expect(overflowMenuTrigger).toBeVisible();
    await page.waitForTimeout(2000);
    await overflowMenuTrigger.click();

    const reciterMenuItem = page.locator('#audio-player-overflow-menu-reciter');
    await expect(reciterMenuItem).toBeVisible();
    await reciterMenuItem.click();

    const reciterList = page.locator('#audio-player-reciter-list');
    await expect(reciterList).toBeVisible();

    const reciterItems = reciterList.locator('[role="menuitem"]');
    await expect(reciterItems.first()).toBeVisible();

    const scrollMetrics = await reciterList.evaluate((element) => ({
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      overflowY: window.getComputedStyle(element).overflowY,
    }));

    expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
    expect(['auto', 'scroll']).toContain(scrollMetrics.overflowY);

    const recitersCount = await reciterItems.count();
    expect(recitersCount).toBeGreaterThan(0);

    const lastReciter = reciterItems.nth(recitersCount - 1);
    await lastReciter.scrollIntoViewIfNeeded();
    await lastReciter.click();

    await expect(lastReciter.locator('svg')).toBeVisible();
  },
);
