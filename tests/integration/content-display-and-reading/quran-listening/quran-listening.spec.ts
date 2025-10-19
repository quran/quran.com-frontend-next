/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import AudioUtilities from '@/tests/POM/audio-utilities';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;
let audioUtilities: AudioUtilities;

test.beforeEach(async ({ page, context }) => {
  test.slow();

  homePage = new Homepage(page, context);
  audioUtilities = new AudioUtilities(page);

  await homePage.goTo('/1');
});

test(
  'Clicking the "Listen" button in the reader header toggles play and pause',
  { tag: ['@slow', '@reading', '@audio'] },
  async ({ page }) => {
    const playButton = page.getByTestId('listen-button');
    await expect(playButton).toBeVisible();
    await audioUtilities.startAudioPlayback(true);

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

      const firstWord = page.locator('[data-word-location="9:1:1"]');
      const secondWord = page.locator('[data-word-location="9:1:2"]');
      const thirdWord = page.locator('[data-word-location="9:1:3"]');

      await expect(firstWord).not.toHaveClass(/highlighted/);

      // Start audio playback and wait for the API response simultaneously
      const [, audioResponse] = await Promise.all([
        audioUtilities.startAudioPlayback(true),
        page.waitForResponse((response) => response.url().includes('segments=true')),
      ]);

      // Extract segments from the API response
      const audioData = await audioResponse.json();
      const firstVerseTimings = audioData.audio_files[0].verse_timings[0];
      const segments = firstVerseTimings.segments
        .slice(0, 3)
        .map((segment) => segment.map((time) => time / 1000)); // Take first 3 segments for testing and / 1000 to convert to seconds

      // Goes to the start of the second segment
      await audioUtilities.setAudioTime(segments[0][2] + 0.1);

      await page.waitForTimeout(1000); // Make sure the data is ready

      // Now, go back to the start
      await audioUtilities.setAudioTime(0);
      await page.waitForTimeout(1000); // Wait a bit for the highlight to apply
      await audioUtilities.pauseAudioPlayback();

      // The first word should be highlighted and not the third
      await expect(secondWord).not.toHaveClass(/highlighted/);
      await expect(firstWord).toHaveClass(/highlighted/);

      await audioUtilities.setAudioTime(segments[0][2] + 0.1); // Move to just after the first word
      await audioUtilities.resumeAudioPlayback();
      await audioUtilities.pauseAudioPlayback();

      // When the second word is being recited, it should be highlighted and the first should not
      await expect(secondWord).toHaveClass(/highlighted/);
      await expect(firstWord).not.toHaveClass(/highlighted/);

      await audioUtilities.setAudioTime(segments[1][2] + 0.1); // Move to just after the second word
      await audioUtilities.resumeAudioPlayback();
      await audioUtilities.pauseAudioPlayback();

      // When the third word is being recited, it should be highlighted and the second should not
      await expect(thirdWord).toHaveClass(/highlighted/);
      await expect(secondWord).not.toHaveClass(/highlighted/);
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

  test('Opening repeat modal from overflow menu displays modal content', async ({ page }) => {
    await audioUtilities.startAudioPlayback();
    await audioUtilities.openOverflowMenu();

    const repeatItem = page
      .getByRole('menuitem')
      .filter({ hasText: /repeat/i })
      .first();
    await repeatItem.click();
    // Check that the modal is open
    await expect(page.getByTestId('repeat-audio-modal')).toBeVisible({ timeout: 5000 });
  });

  test('Repeat modal has persistent values', async ({ page }) => {
    // Unskip this modal when PR QF-239 is merged
    test.skip(true, 'Unskip when QF-239 is merged');

    await audioUtilities.startAudioPlayback();
    await audioUtilities.openOverflowMenu();

    const repeatItem = page
      .getByRole('menuitem')
      .filter({ hasText: /repeat/i })
      .first();
    await repeatItem.click();

    // Wait for the modal to be visible
    const modal = page.getByTestId('repeat-audio-modal');
    await expect(modal).toBeVisible();
    // Change some values
    const rangeFrom = modal.locator('input[aria-owns="start"]');
    const rangeTo = modal.locator('input[aria-owns="end"]');

    await rangeFrom.fill('1:2');

    // a div with text "1:2" should appear in the dropdown options
    const option = modal.getByText('1:2', { exact: true }).first();
    await option.click();

    await rangeTo.fill('1:2');
    const option2 = modal.getByText('1:2', { exact: true }).nth(1);
    await option2.click();

    // Close the modal
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');

    // Reopen the modal
    await audioUtilities.openOverflowMenu();
    await repeatItem.click();
    await expect(modal).toBeVisible();
    // Check that the values are persisted
    await expect(modal.locator('input[aria-owns="start"]')).toHaveValue('1:2');
    await expect(modal.locator('input[aria-owns="end"]')).toHaveValue('1:2');
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
