import { test, expect, Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

// Simple utility functions to reduce code duplication
const startAudioPlayback = async (page) => {
  await page.getByTestId('listen-button').click();
};

const waitForAudioPlayback = async (page: Page) => {
  const audioElement = page.locator('#audio-player');
  await expect
    .poll(async () => audioElement.evaluate((audio: HTMLAudioElement) => audio.currentTime))
    .toBeGreaterThan(0);
};

test.beforeEach(async ({ page, context, isMobile }) => {
  homePage = new Homepage(page, context);

  await homePage.goTo('/101');

  await homePage.enableMushafMode(isMobile);
});

test(
  'Currently read mushaf line is highlighted when audio is playing',
  { tag: ['@slow', '@reading', '@audio', '@mushaf'] },
  async ({ page }) => {
    const playButton = page.getByTestId('listen-button');
    await expect(playButton).toBeVisible();
    await playButton.click();

    // The first line should be highlighted
    const firstLine = page.getByTestId('verse-arabic-101:1');
    await expect(firstLine).toHaveClass(/highlight/);

    // Wait until audio playback actually starts before navigating
    await waitForAudioPlayback(page);

    // Move the verse 5
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    // The highlight should move to a different line
    const secondLine = page.getByTestId('verse-arabic-101:5');
    await expect(secondLine).toHaveClass(/highlight/);
    await expect(firstLine).not.toHaveClass(/highlight/);
  },
);

test(
  'Word are highlighted when they are being recited in mushaf mode',
  { tag: ['@slow', '@reading', '@audio', '@mushaf'] },
  async ({ page }) => {
    const firstWord = page.locator('[data-word-location="101:1:1"]');
    const thirdWord = page.locator('[data-word-location="101:2:2"]');

    await expect(firstWord).not.toHaveClass(/highlighted/);

    await startAudioPlayback(page);

    // The first word should be highlighted and not the third
    await expect(thirdWord).not.toHaveClass(/highlighted/);
    await expect(firstWord).toHaveClass(/highlighted/);

    // When the third word is being recited, it should be highlighted and the first should not
    await expect(thirdWord).toHaveClass(/highlighted/);
    await expect(firstWord).not.toHaveClass(/highlighted/);
  },
);
