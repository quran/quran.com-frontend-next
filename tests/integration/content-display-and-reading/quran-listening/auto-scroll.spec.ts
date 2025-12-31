import { test, expect } from '@playwright/test';

import AudioUtilities from '@/tests/POM/audio-utilities';
import Homepage from '@/tests/POM/home-page';
import { getVerseTestId, TestId } from '@/tests/test-ids';

let homePage: Homepage;
let audioUtilities: AudioUtilities;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  audioUtilities = new AudioUtilities(page);

  await homePage.goTo('/68');
});

test(
  'When playing audio, the verse being played is scrolled into view',
  { tag: ['@reading', '@audio', '@scroll'] },
  async ({ page }) => {
    // Find the play button of the fourth ayah
    const fourthAyah = page.getByTestId(getVerseTestId('68:4'));
    const fourthAyahPlayButton = fourthAyah.locator('#play-verse-button');
    await expect(fourthAyahPlayButton).toBeVisible();

    const currentScrollPosition = await page.evaluate(() => window.scrollY);

    await fourthAyahPlayButton.click();
    await audioUtilities.waitForAudioPlayback();

    // The page should scroll down to bring the fourth ayah into view
    await expect(fourthAyah).toBeInViewport();
    const newScrollPosition = await page.evaluate(() => window.scrollY);
    expect(newScrollPosition).toBeGreaterThan(currentScrollPosition);
  },
);

test(
  'When playing a verse not in view, it is scrolled into view and the navbar hidden',
  { tag: ['@slow', '@reading', '@audio', '@scroll'] },
  async ({ page }) => {
    // TODO: unskip this test when the PR #2531 about QF-1295 is merged
    test.skip(true, 'Unskip this when PR #2531 about QF-1295 is merged');
    const firstAyah = page.getByTestId(getVerseTestId('68:1'));
    const secondAyah = page.getByTestId(getVerseTestId('68:2'));

    await audioUtilities.startAudioPlayback(false);
    await audioUtilities.pauseAudioPlayback();
    await audioUtilities.setAudioSpeed('1.75'); // speed up the audio to reduce test time

    // Scroll down
    await page.mouse.wheel(0, 800);

    // Scroll up a little to make the navbar show
    await page.mouse.wheel(0, -50);
    await page.waitForTimeout(1500); // wait for the navbar to appear
    await expect(page.getByTestId(TestId.NAVBAR).getAttribute('data-isvisible')).resolves.toBe(
      'true',
    );

    const currentScrollPosition = await page.evaluate(() => window.scrollY);

    await audioUtilities.resumeAudioPlayback();

    // The page should scroll up to bring the first ayah into view and the navbar should hide
    await expect(secondAyah).toHaveClass(/highlighted/, { timeout: 15000 }); // wait until the second ayah has been read
    await page.waitForTimeout(1500); // wait for the navbar to hide
    await expect(page.getByTestId(TestId.NAVBAR).getAttribute('data-isvisible')).resolves.toBe(
      'false',
    );
    await expect(firstAyah).toBeInViewport();

    const newScrollPosition = await page.evaluate(() => window.scrollY);
    expect(newScrollPosition).toBeLessThan(currentScrollPosition);
  },
);
