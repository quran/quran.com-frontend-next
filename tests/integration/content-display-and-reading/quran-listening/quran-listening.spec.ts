/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

// Simple utility functions to reduce code duplication
const startAudioPlayback = async (page) => {
  await page.getByTestId('listen-button').click();
};

const openOverflowMenu = async (page) => {
  const overflowMenuTrigger = page.locator('#audio-player-overflow-menu-trigger');
  await page.waitForTimeout(1500); // wait for stable state
  await overflowMenuTrigger.click();
};

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);

  await homePage.goTo('/103');
});

test(
  'Clicking the "Listen" button in the reader header toggles play and pause',
  { tag: ['@slow', '@reading', '@audio'] },
  async ({ page }) => {
    const playButton = page.getByTestId('listen-button');
    await expect(playButton).toBeVisible();
    await playButton.click();

    // The button should change to "Pause"
    const pauseButton = page.getByTestId('pause-button');
    await expect(pauseButton).toBeVisible();

    // Pause the audio
    await pauseButton.click();

    // The button should change back to "Listen"
    await expect(playButton).toBeVisible();
  },
);

test(
  'The play button shows the playback control bar when clicked',
  {
    tag: ['@slow', '@reading', '@audio'],
  },
  async ({ page }) => {
    const playBar = page.getByTestId('audio-player-body');
    await expect(playBar).not.toBeVisible();

    const playButton = page.getByTestId('listen-button');
    await expect(playButton).toBeVisible();
    await playButton.click();

    await expect(playBar).toBeVisible();
  },
);

test(
  'Audio playback highlights the current ayah and moves highlight as audio progresses',
  { tag: ['@slow', '@reading', '@audio'] },
  async ({ page }) => {
    const playButton = page.getByTestId('listen-button');
    await expect(playButton).toBeVisible();
    await playButton.click();

    // The first ayah should be highlighted
    const firstAyah = page.getByTestId('verse-103:1');
    await expect(firstAyah).toHaveClass(/highlighted/);

    // After some time, the highlight should move to the next ayah
    await expect(firstAyah).not.toHaveClass(/highlighted/, { timeout: 10000 }); // wait until the first ayah has been read

    const secondAyah = page.getByTestId('verse-103:2');
    await expect(secondAyah).toHaveClass(/highlighted/);
  },
);

test.describe('Audio Player Advanced Behaviour', () => {
  test('Play button mounts player and internal controls appear', async ({ page }) => {
    await startAudioPlayback(page);
    await expect(page.getByTestId('audio-player-body')).toBeVisible();
    await expect(
      page.getByTestId('audio-play-toggle').or(page.getByTestId('audio-pause-toggle')),
    ).toBeVisible();
  });

  test('Toggling inline play/pause button updates state', async ({ page }) => {
    await startAudioPlayback(page);
    // first click should start playing -> pause toggle visible
    await expect(page.getByTestId('audio-pause-toggle')).toBeVisible();
    await page.getByTestId('audio-pause-toggle').click();
    await expect(page.getByTestId('audio-play-toggle')).toBeVisible();
  });

  test('Prev ayah button disabled on first ayah then enabled after moving forward', async ({
    page,
  }) => {
    await startAudioPlayback(page);
    const prev = page.getByTestId('audio-prev-ayah');
    const next = page.getByTestId('audio-next-ayah');
    await expect(prev).toBeDisabled();
    await expect(next).not.toBeDisabled();
    await next.click();
    await expect(prev).not.toBeDisabled();
  });

  test('Next ayah button disables at last ayah', async ({ page }) => {
    await startAudioPlayback(page);
    const next = page.getByTestId('audio-next-ayah');
    // Surat Al-Asr has 3 ayat. Click next twice.
    await next.click();
    await next.click();
    await expect(next).toBeDisabled();
  });

  test('Slider elapsed value increases over time while playing', async ({ page }) => {
    await startAudioPlayback(page);
    const elapsed = page.getByTestId('audio-elapsed');
    const initial = await elapsed.textContent();
    await page.waitForTimeout(2500);
    const later = await elapsed.textContent();
    expect(initial).not.toBe(later);
  });

  test('Closing the audio player hides body but leaves inline chapter button usable', async ({
    page,
  }) => {
    await startAudioPlayback(page);
    await expect(page.getByTestId('audio-player-body')).toBeVisible();
    await page.getByTestId('audio-close-player').click();
    await expect(page.getByTestId('audio-player-body')).not.toBeVisible();
    await expect(page.getByTestId('listen-button')).toBeVisible();
  });

  test('Playback rate menu changes speed and persists selection UI', async ({ page }) => {
    await startAudioPlayback(page);

    // open overflow menu
    await openOverflowMenu(page);

    // select playback rate
    const playbackItem = page.getByTestId('playback-rate-menu');
    await expect(playbackItem).toBeVisible();
    await playbackItem.click();
    const targetRate = page.getByRole('menuitem').filter({ hasText: '1.75' }); // select 1.75x
    await targetRate.click();

    // reopen menu to verify selection check icon presence
    await page.keyboard.press('Escape'); // close menu
    await expect(playbackItem).not.toBeVisible();
    await openOverflowMenu(page);

    // Selection should be persisted
    await expect(page.getByRole('menuitem').filter({ hasText: '1.75' })).toBeVisible();
  });

  test('Opening repeat modal from overflow menu displays modal content', async ({ page }) => {
    await startAudioPlayback(page);
    await openOverflowMenu(page);

    const repeatItem = page
      .getByRole('menuitem')
      .filter({ hasText: /repeat/i })
      .first();
    await repeatItem.click();
    // Check that the modal is open
    await expect(page.getByTestId('repeat-audio-modal')).toBeVisible({ timeout: 5000 });
  });

  test('Arrow navigation goes to the correct ayah', async ({ page }) => {
    await startAudioPlayback(page);

    const secondAyah = page.getByTestId('verse-103:2');
    const thirdAyah = page.getByTestId('verse-103:3');
    await expect(secondAyah).not.toHaveClass(/highlighted/);
    await expect(thirdAyah).not.toHaveClass(/highlighted/);

    // Move forward using keyboard interaction
    await page.keyboard.press('ArrowRight');
    await expect(secondAyah).toHaveClass(/highlighted/);

    // Move forward again to go to next ayah
    await page.keyboard.press('ArrowRight');
    await expect(thirdAyah).toHaveClass(/highlighted/);

    // Move backward to go back to second ayah
    await page.keyboard.press('ArrowLeft');
    await expect(secondAyah).toHaveClass(/highlighted/);
  });
});
