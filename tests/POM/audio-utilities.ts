/* eslint-disable react-func/max-lines-per-function */
import { expect, Page } from '@playwright/test';

export default class AudioUtilities {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Simple utility functions to reduce code duplication
  // Simulate deterministic audio playback so tests don't rely on real MP3 loading.
  async installAudioPlaybackMock() {
    await this.page.addInitScript(() => {
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
  }

  async waitForAudioElement() {
    const audioElement = this.page.locator('#audio-player');
    await audioElement.waitFor({ state: 'attached' });
    return audioElement;
  }

  async waitForAudioPlayback() {
    const audioElement = await this.waitForAudioElement();
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
  }

  async startAudioPlayback(waitForPlayback = true) {
    const listenButton = this.page.getByTestId('listen-button');
    await expect(listenButton).toBeVisible();
    await listenButton.click();
    if (waitForPlayback) {
      await this.waitForAudioPlayback();
    }
  }

  async openOverflowMenu() {
    const overflowMenuTrigger = this.page.locator('#audio-player-overflow-menu-trigger');
    await this.waitForAudioPlayback();
    await expect(async () => {
      await overflowMenuTrigger.click({ trial: true });
    }).toPass({ timeout: 5000 });
    await overflowMenuTrigger.click();
  }

  async resumeAudioPlayback() {
    const playButton = this.page.getByTestId('audio-play-toggle');
    await expect(playButton).toBeVisible();
    await playButton.click();
  }

  async pauseAudioPlayback() {
    const pauseButton = this.page.getByTestId('audio-pause-toggle');
    await expect(pauseButton).toBeVisible();
    await pauseButton.click();
  }

  async setAudioSpeed(speed: string) {
    // open overflow menu
    await this.openOverflowMenu();

    // select playback rate
    const playbackItem = this.page.getByTestId('playback-rate-menu');
    await expect(playbackItem).toBeVisible();
    await playbackItem.click();
    const targetRate = this.page.getByRole('menuitem').filter({ hasText: speed }); // select the speed
    await targetRate.click();

    await this.page.keyboard.press('Escape'); // close the overflow menu
  }
}
