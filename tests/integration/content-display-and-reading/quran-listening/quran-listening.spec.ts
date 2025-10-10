/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

// Simple utility functions to reduce code duplication
// Simulate deterministic audio playback so tests don't rely on real MP3 loading.
const installAudioPlaybackMock = async (page: Page) => {
  await page.addInitScript(() => {
    const globalWindow = window as typeof window & { audioPlaybackMockInstalled?: boolean };
    if (globalWindow.audioPlaybackMockInstalled) return;
    globalWindow.audioPlaybackMockInstalled = true;

    const playbackTimers = new WeakMap<HTMLMediaElement, number>();

    const clearTimer = (audio: HTMLMediaElement) => {
      const timer = playbackTimers.get(audio);
      if (timer) {
        window.clearInterval(timer);
        playbackTimers.delete(audio);
      }
    };

    const startTimer = (audio: HTMLMediaElement) => {
      clearTimer(audio);
      const timer = window.setInterval(() => {
        // eslint-disable-next-line no-param-reassign
        audio.currentTime += 0.75;
        audio.dispatchEvent(new Event('timeupdate'));
        audio.dispatchEvent(new Event('progress'));
        const duration =
          Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 120;
        if (audio.currentTime >= duration) {
          clearTimer(audio);
          audio.dispatchEvent(new Event('ended'));
        }
      }, 200);
      playbackTimers.set(audio, timer);
    };

    HTMLMediaElement.prototype.play = function play() {
      this.dispatchEvent(new Event('canplay'));
      this.dispatchEvent(new Event('play'));
      this.dispatchEvent(new Event('playing'));
      startTimer(this);
      return Promise.resolve();
    };

    HTMLMediaElement.prototype.pause = function pause() {
      clearTimer(this);
      this.dispatchEvent(new Event('pause'));
    };
  });
};

const waitForAudioElement = async (page: Page) => {
  const audioElement = page.locator('#audio-player');
  await audioElement.waitFor({ state: 'attached' });
  return audioElement;
};

const waitForAudioPlayback = async (page: Page) => {
  const audioElement = await waitForAudioElement(page);
  await expect
    .poll(
      async () => {
        try {
          return await audioElement.evaluate((audio: HTMLAudioElement) => audio.currentTime);
        } catch (error) {
          return 0;
        }
      },
      { timeout: 10000 },
    )
    .toBeGreaterThan(0);
};

const startAudioPlayback = async (page: Page) => {
  const listenButton = page.getByTestId('listen-button');
  await expect(listenButton).toBeVisible();
  await listenButton.click();
  await waitForAudioPlayback(page);
};

const openOverflowMenu = async (page: Page) => {
  const overflowMenuTrigger = page.locator('#audio-player-overflow-menu-trigger');
  await waitForAudioPlayback(page);
  await expect(async () => {
    await overflowMenuTrigger.click({ trial: true });
  }).toPass({ timeout: 5000 });
  await overflowMenuTrigger.click();
};

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);

  await installAudioPlaybackMock(page);
  await homePage.goTo('/103');
});

test(
  'Clicking the "Listen" button in the reader header toggles play and pause',
  { tag: ['@slow', '@reading', '@audio'] },
  async ({ page }) => {
    const playButton = page.getByTestId('listen-button');
    await expect(playButton).toBeVisible();
    await playButton.click();
    await waitForAudioPlayback(page);

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

    await startAudioPlayback(page);
    await expect(playBar).toBeVisible();
  },
);

test(
  'Audio playback highlights the current ayah and moves highlight as audio progresses',
  { tag: ['@slow', '@reading', '@audio'] },
  async ({ page }) => {
    await startAudioPlayback(page);

    // The first ayah should be highlighted
    const firstAyah = page.getByTestId('verse-103:1');
    await expect(firstAyah).toHaveClass(/highlighted/);

    // After some time, the highlight should move to the next ayah
    await expect(firstAyah).not.toHaveClass(/highlighted/, { timeout: 15000 }); // wait until the first ayah has been read

    const secondAyah = page.getByTestId('verse-103:2');
    await expect(secondAyah).toHaveClass(/highlighted/, { timeout: 15000 });
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
    const initial = (await elapsed.textContent())?.trim();
    await expect
      .poll(async () => (await elapsed.textContent())?.trim() || '')
      .not.toBe(initial || '');
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

test.describe('Verse-Specific Play Button', () => {
  test('Clicking play button on second verse starts audio player and highlights that verse', async ({
    page,
  }) => {
    const secondAyah = page.getByTestId('verse-103:2');
    await expect(secondAyah).not.toHaveClass(/highlighted/);

    const playVerseButton = secondAyah.locator('#play-verse-button');
    await playVerseButton.click();

    await waitForAudioPlayback(page);
    await expect(page.getByTestId('audio-player-body')).toBeVisible();
    await expect(secondAyah).toHaveClass(/highlighted/, { timeout: 5000 });
  });

  test('Clicking play button on third verse starts playback from that verse', async ({ page }) => {
    const thirdAyah = page.getByTestId('verse-103:3');
    await thirdAyah.locator('#play-verse-button').click();

    await waitForAudioPlayback(page);
    await expect(page.getByTestId('audio-player-body')).toBeVisible();
    await expect(thirdAyah).toHaveClass(/highlighted/, { timeout: 5000 });
    await expect(page.getByTestId('audio-pause-toggle')).toBeVisible();
  });

  test('Clicking play on first verse highlights only that verse initially', async ({ page }) => {
    const firstAyah = page.getByTestId('verse-103:1');
    await firstAyah.locator('#play-verse-button').click();

    await waitForAudioPlayback(page);
    await expect(page.getByTestId('audio-player-body')).toBeVisible();
    await expect(firstAyah).toHaveClass(/highlighted/);
    await expect(page.getByTestId('verse-103:2')).not.toHaveClass(/highlighted/);
  });
});
