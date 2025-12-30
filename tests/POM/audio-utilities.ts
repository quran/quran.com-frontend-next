/* eslint-disable max-lines */
/* eslint-disable no-await-in-loop */
/* eslint-disable react-func/max-lines-per-function */
import { expect, Locator, Page } from '@playwright/test';

import { TestId } from '@/tests/test-ids';

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
    const listenButton = this.page.getByTestId(TestId.LISTEN_BUTTON);
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
    const playButton = this.page.getByTestId(TestId.AUDIO_PLAY_TOGGLE);
    await expect(playButton).toBeVisible();
    await playButton.click();
  }

  async pauseAudioPlayback() {
    const pauseButton = this.page.getByTestId(TestId.AUDIO_PAUSE_TOGGLE);
    await expect(pauseButton).toBeVisible();
    await pauseButton.click();
  }

  async setAudioSpeed(speed: string) {
    // open overflow menu
    await this.openOverflowMenu();

    // select playback rate
    const playbackItem = this.page.getByTestId(TestId.PLAYBACK_RATE_MENU);
    await expect(playbackItem).toBeVisible();
    await playbackItem.click();
    const targetRate = this.page.getByRole('menuitem').filter({ hasText: speed }); // select the speed
    await targetRate.click();

    await this.page.keyboard.press('Escape'); // close the overflow menu

    // Set the audio back to the start
    await this.setAudioTime(0);
  }

  async setAudioTime(seconds: number) {
    const audioPlayer = await this.waitForAudioElement();
    await audioPlayer.evaluate((audio: HTMLAudioElement, secs: number) => {
      // eslint-disable-next-line no-param-reassign
      audio.currentTime = secs;
      audio.dispatchEvent(new Event('timeupdate'));
    }, seconds);
  }

  /**
   * Opens the repeat modal by starting audio playback and clicking repeat from the overflow menu
   * @returns {Locator} The modal element
   */
  async openRepeatModal() {
    await this.startAudioPlayback();
    await this.openOverflowMenu();

    const repeatItem = this.page
      .getByRole('menuitem')
      .filter({ hasText: /repeat/i })
      .first();
    await repeatItem.click();

    const modal = this.page.getByTestId(TestId.REPEAT_AUDIO_MODAL);
    await expect(modal).toBeVisible();
    return modal;
  }

  /**
   * Gets a counter input from the repeat modal by counter type
   * @param {string} counterType - The type of counter ('playback-range', 'repeat-each-verse', 'delay-between-verses')
   * @returns {Locator} The counter value locator
   */
  getRepeatModalInput(counterType: string): Locator {
    const modal = this.page.getByTestId(TestId.REPEAT_AUDIO_MODAL);
    const counters = modal.getByTestId(TestId.COUNTER);

    let counterIndex = 0;
    if (counterType === 'playback-range') {
      counterIndex = 0;
    } else if (counterType === 'repeat-each-verse') {
      counterIndex = 1;
    } else if (counterType === 'delay-between-verses') {
      counterIndex = 2;
    }

    return counters.nth(counterIndex).getByTestId(TestId.COUNTER_VALUE);
  }

  /**
   * Helper to adjust counter value by clicking increment/decrement buttons until desired value is reached
   */
  // eslint-disable-next-line class-methods-use-this
  private async adjustCounterValue(counterLocator: Locator, desiredValue: string): Promise<void> {
    let currentValue = await counterLocator.getByTestId(TestId.COUNTER_VALUE).innerText();

    while (currentValue !== desiredValue) {
      const currentNum = parseInt(currentValue, 10);
      const desiredNum = parseInt(desiredValue, 10);

      if (currentNum < desiredNum) {
        await counterLocator.getByTestId(TestId.INCREMENT_BUTTON).click();
      } else {
        await counterLocator.getByTestId(TestId.DECREMENT_BUTTON).click();
      }

      // Update current value for next iteration
      currentValue = await counterLocator.getByTestId(TestId.COUNTER_VALUE).innerText();
    }
  }

  /**
   * Sets verse range values in the repeat modal
   */
  // eslint-disable-next-line class-methods-use-this
  async setRepeatModalValues(
    modal: Locator,
    fromVerse: string,
    toVerse: string,
    playRange: string,
    repeatEachVerse: string,
    delayBetweenVerse: string,
  ): Promise<void> {
    const rangeFrom = modal.locator('input[aria-owns="start"]');
    const rangeTo = modal.locator('input[aria-owns="end"]');

    // There's 3 counter components in the modal, first one is play range,
    // second is repeat each verse, third is delay between verses
    const counters = modal.getByTestId(TestId.COUNTER);
    const playRangeCounter = counters.nth(0);
    const repeatEachVerseCounter = counters.nth(1);
    const delayBetweenVerseCounter = counters.nth(2);

    // Set "from" verse IF different
    if ((await rangeFrom.inputValue()) !== fromVerse) {
      await rangeFrom.fill(fromVerse);
      const optionFrom = modal.getByText(fromVerse, { exact: true }).first();
      await optionFrom.click();
    }

    // Set "to" verse IF different
    if ((await rangeTo.inputValue()) !== toVerse) {
      await rangeTo.fill(toVerse);
      const optionTo = modal.getByText(toVerse, { exact: true }).nth(1);
      await optionTo.click();
    }

    // Set play range by comparing current value with desired value
    await this.adjustCounterValue(playRangeCounter, playRange);

    // Set repeat each verse
    await this.adjustCounterValue(repeatEachVerseCounter, repeatEachVerse);

    // Set delay between verse
    await this.adjustCounterValue(delayBetweenVerseCounter, delayBetweenVerse);
  }

  /**
   * Closes the repeat modal by clicking "Start Playing" and pressing Escape
   */
  async closeRepeatModal(save: boolean = true): Promise<void> {
    await this.page.getByText(save ? 'Start Playing' : 'Cancel').click();
    await this.page.keyboard.press('Escape');
  }
}
