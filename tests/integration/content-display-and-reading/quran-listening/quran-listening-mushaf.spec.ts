import { test, expect } from '@playwright/test';

import AudioUtilities from '@/tests/POM/audio-utilities';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;
let audioUtilities: AudioUtilities;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  audioUtilities = new AudioUtilities(page);
});

test(
  'Currently read mushaf line is highlighted when audio is playing',
  { tag: ['@slow', '@reading', '@audio', '@mushaf'] },
  async ({ page, isMobile }) => {
    await homePage.goTo('/1');

    await homePage.enableMushafMode(isMobile);

    const firstLine = page.getByTestId('verse-arabic-1:1');
    const secondLine = page.getByTestId('verse-arabic-1:2');
    const thirdLine = page.getByTestId('verse-arabic-1:3');

    await expect(firstLine).not.toHaveClass(/highlight/);

    await audioUtilities.startAudioPlayback(false);
    await audioUtilities.pauseAudioPlayback();
    await audioUtilities.setAudioSpeed('0.25');
    await audioUtilities.setAudioTime(0);
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
