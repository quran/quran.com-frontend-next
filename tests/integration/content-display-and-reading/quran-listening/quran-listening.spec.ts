/* eslint-disable no-await-in-loop */

import { test, expect } from '@playwright/test';

import { switchToReadingMode, switchToTranslationMode } from '@/tests/helpers/mode-switching';
import AudioUtilities from '@/tests/POM/audio-utilities';
import Homepage from '@/tests/POM/home-page';
import { getVerseTestId, TestId } from '@/tests/test-ids';

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
    const playButton = page.getByTestId(TestId.LISTEN_BUTTON);
    await expect(playButton).toBeVisible();
    await playButton.click();
    await audioUtilities.waitForAudioPlayback();

    // The button should change to "Pause"
    const pauseButton = page.getByTestId(TestId.PAUSE_BUTTON);
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
      const firstAyah = page.getByTestId(getVerseTestId('1:1'));
      await expect(firstAyah).toHaveClass(/highlighted/);

      // After some time, the highlight should move to the next ayah
      await expect(firstAyah).not.toHaveClass(/highlighted/, { timeout: 15000 }); // wait until the first ayah has been read

      const secondAyah = page.getByTestId(getVerseTestId('1:2'));
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
    await expect(page.getByTestId(TestId.AUDIO_PLAYER_BODY)).toBeVisible();
    await expect(
      page.getByTestId(TestId.AUDIO_PLAY_TOGGLE).or(page.getByTestId(TestId.AUDIO_PAUSE_TOGGLE)),
    ).toBeVisible();
  });

  test('Toggling inline play/pause button updates state', async ({ page }) => {
    await audioUtilities.startAudioPlayback();
    // first click should start playing -> pause toggle visible
    await expect(page.getByTestId(TestId.AUDIO_PAUSE_TOGGLE)).toBeVisible();
    await page.getByTestId(TestId.AUDIO_PAUSE_TOGGLE).click();
    await expect(page.getByTestId(TestId.AUDIO_PLAY_TOGGLE)).toBeVisible();
  });

  test('Prev ayah button disabled on first ayah then enabled after moving forward', async ({
    page,
  }) => {
    await audioUtilities.startAudioPlayback(true);
    await audioUtilities.setAudioTime(0);
    await audioUtilities.pauseAudioPlayback();

    const prev = page.getByTestId(TestId.AUDIO_PREV_AYAH);
    const next = page.getByTestId(TestId.AUDIO_NEXT_AYAH);

    await expect(prev).toBeDisabled();
    await next.click();
    await expect(prev).not.toBeDisabled();
  });

  test('Next ayah button disables at last ayah', async ({ page }) => {
    await audioUtilities.startAudioPlayback(true);
    await audioUtilities.setAudioTime(0);
    await audioUtilities.pauseAudioPlayback();

    const next = page.getByTestId(TestId.AUDIO_NEXT_AYAH);
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
    const elapsed = page.getByTestId(TestId.AUDIO_ELAPSED);
    const initial = (await elapsed.textContent())?.trim();
    await expect
      .poll(async () => (await elapsed.textContent())?.trim() || '')
      .not.toBe(initial || '');
  });

  test('Closing the audio player hides body but leaves inline chapter button usable', async ({
    page,
  }) => {
    await audioUtilities.startAudioPlayback();
    await expect(page.getByTestId(TestId.AUDIO_PLAYER_BODY)).toBeVisible();
    await page.getByTestId(TestId.AUDIO_CLOSE_PLAYER).click();
    await expect(page.getByTestId(TestId.AUDIO_PLAYER_BODY)).not.toBeVisible();
    await expect(page.getByTestId(TestId.LISTEN_BUTTON)).toBeVisible();
  });

  test('Playback rate menu changes speed and persists selection UI', async ({ page }) => {
    await audioUtilities.startAudioPlayback();

    // open overflow menu
    await audioUtilities.openOverflowMenu();

    // select playback rate
    const playbackItem = page.getByTestId(TestId.PLAYBACK_RATE_MENU);
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

    const secondAyah = page.getByTestId(getVerseTestId('1:2'));
    const thirdAyah = page.getByTestId(getVerseTestId('1:3'));
    const fourthAyah = page.getByTestId(getVerseTestId('1:4'));

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

  test('Next/prev buttons scroll to ayah after manual scrolling in translation view', async ({
    page,
  }) => {
    await switchToTranslationMode(page);

    await audioUtilities.startAudioPlayback(true);
    await audioUtilities.setAudioTime(0);
    await audioUtilities.pauseAudioPlayback();

    const firstAyah = page.getByTestId('verse-1:1');
    const secondAyah = page.getByTestId('verse-1:2');
    const lastAyah = page.getByTestId('verse-1:7'); // Al-Fatiha has 7 ayat

    // Initially first ayah should be highlighted
    await expect(firstAyah).toHaveClass(/highlighted/);
    await expect(firstAyah).toBeInViewport();

    // Test next button: scroll to end of page and click next
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500); // wait for scroll to complete

    // Click next ayah button
    const nextButton = page.getByTestId('audio-next-ayah');
    await nextButton.click();

    // Second ayah should be highlighted and in viewport
    await expect(secondAyah).toHaveClass(/highlighted/);
    await expect(secondAyah).toBeInViewport();

    // Navigate to last ayah and test prev button
    // Al-Fatiha has 7 ayat. We're currently at ayah 2, so click next 4 times to reach ayah 6
    for (let i = 3; i < 7; i += 1) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // Now at ayah 6, click next one more time to reach ayah 7
    await nextButton.click();
    await expect(lastAyah).toHaveClass(/highlighted/);
    await expect(lastAyah).toBeInViewport();

    // Scroll to very top of page
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Click previous button
    const prevButton = page.getByTestId('audio-prev-ayah');
    await prevButton.click();

    // Should scroll back to previous ayah (6th ayah)
    const sixthAyah = page.getByTestId('verse-1:6');
    await expect(sixthAyah).toHaveClass(/highlighted/);
    await expect(sixthAyah).toBeInViewport();
  });

  test('Next/prev buttons scroll to ayah after manual scrolling in reading view', async ({
    page,
  }) => {
    await switchToReadingMode(page);

    await audioUtilities.startAudioPlayback(true);
    await audioUtilities.setAudioTime(0);
    await audioUtilities.pauseAudioPlayback();

    const firstAyah = page.getByTestId('verse-arabic-1:1');
    const secondAyah = page.getByTestId('verse-arabic-1:2');

    /**
     * Reading mode can show the same ayah across multiple lines, so we grab the first occurrence
     * using .first() to make sure we're testing the right element.
     */

    // Initially first ayah should be highlighted
    await expect(firstAyah.first()).toHaveClass(/highlighted/);
    await expect(firstAyah.first()).toBeInViewport();

    // Test next button: scroll to end of page and click next
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500); // wait for scroll to complete

    // Click next ayah button
    const nextButton = page.getByTestId('audio-next-ayah');
    await nextButton.click();

    // Second ayah should be highlighted and in viewport
    await expect(secondAyah.first()).toHaveClass(/highlighted/);
    await expect(secondAyah.first()).toBeInViewport();

    // Test prev button: when on second ayah, scroll to bottom and click prev
    // Scroll to bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500); // wait for scroll to complete

    // Click previous button
    const prevButton = page.getByTestId('audio-prev-ayah');
    await prevButton.click();

    // Should scroll back to first ayah
    await expect(firstAyah.first()).toHaveClass(/highlighted/);
    await expect(firstAyah.first()).toBeInViewport();
  });

  test('Rapid next/prev clicking does not cause incorrect scroll position', async ({ page }) => {
    await audioUtilities.startAudioPlayback(true);
    await audioUtilities.setAudioTime(0);
    await audioUtilities.pauseAudioPlayback();

    // Scroll to bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const nextButton = page.getByTestId(TestId.AUDIO_NEXT_AYAH);

    // Click next 5 times rapidly without waiting, but ensure button is not disabled before each click
    for (let i = 0; i < 5; i += 1) {
      await expect(nextButton).not.toBeDisabled();
      await nextButton.click();
    }

    // Should end up at ayah 6, not some intermediate state
    const sixthAyah = page.getByTestId(getVerseTestId('1:6'));
    await expect(sixthAyah).toHaveClass(/highlighted/);
  });
});

test.describe('Verse-Specific Play Button', () => {
  test('Clicking play button on second verse starts audio player and highlights that verse', async ({
    page,
  }) => {
    const secondAyah = page.getByTestId(getVerseTestId('1:2'));
    await expect(secondAyah).not.toHaveClass(/highlighted/);

    const playVerseButton = secondAyah.locator('#play-verse-button');
    await playVerseButton.click();

    await audioUtilities.waitForAudioPlayback();
    await expect(page.getByTestId(TestId.AUDIO_PLAYER_BODY)).toBeVisible();
    await expect(secondAyah).toHaveClass(/highlighted/, { timeout: 5000 });
  });
});
