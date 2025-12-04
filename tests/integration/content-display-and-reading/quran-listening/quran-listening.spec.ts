/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import AudioUtilities from '@/tests/POM/audio-utilities';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;
let audioUtilities: AudioUtilities;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  audioUtilities = new AudioUtilities(page);

  await homePage.goTo('/1');
});

test(
  'Clicking the "Listen" button in the reader header toggles play and pause',
  { tag: ['@slow', '@reading', '@audio', '@smoke'] },
  async ({ page }) => {
    const playButton = page.getByTestId('listen-button');
    await expect(playButton).toBeVisible();
    await playButton.click();
    await audioUtilities.waitForAudioPlayback();

    // The button should change to "Pause"
    const pauseButton = page.getByTestId('pause-button');
    await expect(pauseButton).toBeVisible();

    // Pause the audio
    await pauseButton.click();

    // The button should change back to "Listen"
    await expect(playButton).toBeVisible();
  },
);

test.describe('Highlighting', () => {
  test(
    'Audio playback highlights the current ayah and moves highlight as audio progresses',
    { tag: ['@slow', '@reading', '@audio'] },
    async ({ page }) => {
      await audioUtilities.startAudioPlayback(true);
      await audioUtilities.setAudioTime(0);

      // The first ayah should be highlighted
      const firstAyah = page.getByTestId('verse-1:1');
      await expect(firstAyah).toHaveClass(/highlighted/);

      // After some time, the highlight should move to the next ayah
      await expect(firstAyah).not.toHaveClass(/highlighted/, { timeout: 15000 }); // wait until the first ayah has been read

      const secondAyah = page.getByTestId('verse-1:2');
      await expect(secondAyah).toHaveClass(/highlighted/, { timeout: 15000 });
    },
  );

  test(
    'Word are highlighted when they are being recited',
    { tag: ['@slow', '@reading', '@audio', '@mushaf'] },
    async ({ page }) => {
      await homePage.goTo('/9');

      // Start audio playback and wait for the API response simultaneously
      await Promise.all([
        audioUtilities.startAudioPlayback(true),
        page.waitForResponse((response) => response.url().includes('segments=true')),
        page.waitForSelector("[class*='highlighted']"),
      ]);

      // Instead of relying on specific word indexes or timestamps, watch the DOM for whichever
      // word currently carries the `highlighted` class and ensure the highlight moves forward
      // while the audio plays. This mirrors real behaviour: the reciter advances naturally and
      // each previously highlighted word should lose the class once the next one is read.
      const highlightedWordLocator = page
        .locator('[data-word-location][class*="highlighted"]')
        .first();

      const getHighlightedWordLocation = async () =>
        (await highlightedWordLocator.getAttribute('data-word-location')) || '';

      const waitForHighlightChange = async (previousLocation: string) => {
        let currentLocation = previousLocation;
        await expect(async () => {
          currentLocation = await getHighlightedWordLocation();
          expect(currentLocation).not.toBe(previousLocation);
        }).toPass({ timeout: 20000 });
        return currentLocation;
      };

      const firstHighlightedLocation = await getHighlightedWordLocation();
      expect(firstHighlightedLocation).toMatch(/^9:1:/);

      const secondHighlightedLocation = await waitForHighlightChange(firstHighlightedLocation);
      expect(secondHighlightedLocation).toMatch(/^9:1:/);

      const firstHighlightedWord = page.locator(
        `[data-word-location="${firstHighlightedLocation}"]`,
      );
      const secondHighlightedWord = page.locator(
        `[data-word-location="${secondHighlightedLocation}"]`,
      );
      await expect(firstHighlightedWord).not.toHaveClass(/highlighted/);
      await expect(secondHighlightedWord).toHaveClass(/highlighted/);

      const thirdHighlightedLocation = await waitForHighlightChange(secondHighlightedLocation);
      expect(thirdHighlightedLocation).toMatch(/^9:1:/);

      const thirdHighlightedWord = page.locator(
        `[data-word-location="${thirdHighlightedLocation}"]`,
      );
      await expect(secondHighlightedWord).not.toHaveClass(/highlighted/);
      await expect(thirdHighlightedWord).toHaveClass(/highlighted/);

      await audioUtilities.pauseAudioPlayback();
    },
  );
});

test.describe('Audio Player Advanced Behaviour', () => {
  test('Play button mounts player and internal controls appear', async ({ page }) => {
    await audioUtilities.startAudioPlayback();
    await expect(page.getByTestId('audio-player-body')).toBeVisible();
    await expect(
      page.getByTestId('audio-play-toggle').or(page.getByTestId('audio-pause-toggle')),
    ).toBeVisible();
  });

  test('Toggling inline play/pause button updates state', async ({ page }) => {
    await audioUtilities.startAudioPlayback();
    // first click should start playing -> pause toggle visible
    await expect(page.getByTestId('audio-pause-toggle')).toBeVisible();
    await page.getByTestId('audio-pause-toggle').click();
    await expect(page.getByTestId('audio-play-toggle')).toBeVisible();
  });

  test('Prev ayah button disabled on first ayah then enabled after moving forward', async ({
    page,
  }) => {
    await audioUtilities.startAudioPlayback(true);
    await audioUtilities.setAudioTime(0);
    await audioUtilities.pauseAudioPlayback();

    const prev = page.getByTestId('audio-prev-ayah');
    const next = page.getByTestId('audio-next-ayah');

    await expect(prev).toBeDisabled();
    await next.click();
    await expect(prev).not.toBeDisabled();
  });

  test('Next ayah button disables at last ayah', async ({ page }) => {
    await audioUtilities.startAudioPlayback(true);
    await audioUtilities.setAudioTime(0);
    await audioUtilities.pauseAudioPlayback();

    const next = page.getByTestId('audio-next-ayah');
    // Surat Al-Fatiha has 7 ayat. Click next 6 times to reach the last ayah.
    await next.click({ delay: 100 });
    await next.click({ delay: 100 });
    await next.click({ delay: 100 });
    await next.click({ delay: 100 });
    await next.click({ delay: 100 });
    await next.click({ delay: 100 });
    await expect(next).toBeDisabled();
  });

  test('Slider elapsed value increases over time while playing', async ({ page }) => {
    await audioUtilities.startAudioPlayback();
    const elapsed = page.getByTestId('audio-elapsed');
    const initial = (await elapsed.textContent())?.trim();
    await expect
      .poll(async () => (await elapsed.textContent())?.trim() || '')
      .not.toBe(initial || '');
  });

  test('Closing the audio player hides body but leaves inline chapter button usable', async ({
    page,
  }) => {
    await audioUtilities.startAudioPlayback();
    await expect(page.getByTestId('audio-player-body')).toBeVisible();
    await page.getByTestId('audio-close-player').click();
    await expect(page.getByTestId('audio-player-body')).not.toBeVisible();
    await expect(page.getByTestId('listen-button')).toBeVisible();
  });

  test('Playback rate menu changes speed and persists selection UI', async ({ page }) => {
    await audioUtilities.startAudioPlayback();

    // open overflow menu
    await audioUtilities.openOverflowMenu();

    // select playback rate
    const playbackItem = page.getByTestId('playback-rate-menu');
    await expect(playbackItem).toBeVisible();
    await playbackItem.click();
    const targetRate = page.getByRole('menuitem').filter({ hasText: '1.75' }); // select 1.75x
    await targetRate.click();

    // reopen menu to verify selection check icon presence
    await page.keyboard.press('Escape'); // close menu
    await expect(playbackItem).not.toBeVisible();
    await audioUtilities.openOverflowMenu();

    // Selection should be persisted
    await expect(page.getByRole('menuitem').filter({ hasText: '1.75' })).toBeVisible();
  });

  test('Arrow navigation goes to the correct ayah', async ({ page }) => {
    await audioUtilities.startAudioPlayback(true);
    await audioUtilities.setAudioTime(0);
    await audioUtilities.pauseAudioPlayback();

    const secondAyah = page.getByTestId('verse-1:2');
    const thirdAyah = page.getByTestId('verse-1:3');
    const fourthAyah = page.getByTestId('verse-1:4');

    await expect(secondAyah).not.toHaveClass(/highlighted/);
    await expect(thirdAyah).not.toHaveClass(/highlighted/);
    await expect(fourthAyah).not.toHaveClass(/highlighted/);

    // Move forward using keyboard interaction
    await page.keyboard.press('ArrowRight');
    await expect(secondAyah).toHaveClass(/highlighted/);

    // Move forward again to go to next ayah
    await page.keyboard.press('ArrowRight');
    await expect(thirdAyah).toHaveClass(/highlighted/);

    // Move forward once more to test with longer verses
    await page.keyboard.press('ArrowRight');
    await expect(fourthAyah).toHaveClass(/highlighted/);

    // Move backward to go back to third ayah
    await page.keyboard.press('ArrowLeft');
    await expect(thirdAyah).toHaveClass(/highlighted/);

    // Move backward to go back to second ayah
    await page.keyboard.press('ArrowLeft');
    await expect(secondAyah).toHaveClass(/highlighted/);
  });
});

test.describe('Verse-Specific Play Button', () => {
  test('Clicking play button on second verse starts audio player and highlights that verse', async ({
    page,
  }) => {
    const secondAyah = page.getByTestId('verse-1:2');
    await expect(secondAyah).not.toHaveClass(/highlighted/);

    const playVerseButton = secondAyah.locator('#play-verse-button');
    await playVerseButton.click();

    await audioUtilities.waitForAudioPlayback();
    await expect(page.getByTestId('audio-player-body')).toBeVisible();
    await expect(secondAyah).toHaveClass(/highlighted/, { timeout: 5000 });
  });
});
