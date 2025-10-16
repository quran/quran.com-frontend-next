import { test, expect } from '@playwright/test';

import AudioUtilities from '@/tests/POM/audio-utilities';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;
let audioUtilities: AudioUtilities;

test.beforeEach(async ({ page, context, isMobile }) => {
  homePage = new Homepage(page, context);
  audioUtilities = new AudioUtilities(page);

  await homePage.goTo('/1');

  await homePage.enableMushafMode(isMobile);
});

test(
  'Currently read mushaf line is highlighted when audio is playing',
  { tag: ['@slow', '@reading', '@audio', '@mushaf'] },
  async ({ page }) => {
    const firstLine = page.getByTestId('verse-arabic-1:1');
    const secondLine = page.getByTestId('verse-arabic-1:2');
    const thirdLine = page.getByTestId('verse-arabic-1:3');

    await expect(firstLine).not.toHaveClass(/highlight/);

    await audioUtilities.startAudioPlayback(false);
    await audioUtilities.pauseAudioPlayback();
    await audioUtilities.setAudioSpeed('0.25');
    await audioUtilities.resumeAudioPlayback();

    // The first line should be highlighted
    await expect(firstLine).toHaveClass(/highlight/);

    // Move to next verse
    await page.keyboard.press('ArrowRight', { delay: 100 });

    // The highlight should have moved to the second line
    await expect(secondLine).toHaveClass(/highlight/);
    await expect(firstLine).not.toHaveClass(/highlight/);

    // Move to next verse
    await page.keyboard.press('ArrowRight', { delay: 100 });

    // The highlight should have moved to the third line
    await expect(thirdLine).toHaveClass(/highlight/);
    await expect(secondLine).not.toHaveClass(/highlight/);
  },
);

test(
  'Word are highlighted when they are being recited in mushaf mode',
  { tag: ['@slow', '@reading', '@audio', '@mushaf'] },
  async ({ page }) => {
    const firstWord = page.locator('[data-word-location="1:1:1"]');
    const secondWord = page.locator('[data-word-location="1:1:2"]');
    const thirdWord = page.locator('[data-word-location="1:1:3"]');

    await expect(firstWord).not.toHaveClass(/highlighted/);

    // Start and immediately pause the audio playback to show the lecture settings
    await audioUtilities.startAudioPlayback(false);
    await audioUtilities.pauseAudioPlayback();
    await audioUtilities.setAudioSpeed('0.25');

    // Resume the playback
    await audioUtilities.resumeAudioPlayback();

    // The first word should be highlighted and not the third
    await expect(secondWord).not.toHaveClass(/highlighted/);
    await expect(firstWord).toHaveClass(/highlighted/);

    // When the second word is being recited, it should be highlighted and the first should not
    await expect(secondWord).toHaveClass(/highlighted/);
    await expect(firstWord).not.toHaveClass(/highlighted/);

    // When the third word is being recited, it should be highlighted and the second should not
    await expect(thirdWord).toHaveClass(/highlighted/);
    await expect(secondWord).not.toHaveClass(/highlighted/);
  },
);
