import { test, expect } from '@playwright/test';

import AudioUtilities from '@/tests/POM/audio-utilities';
import Homepage from '@/tests/POM/home-page';

// Force sequential execution: setup runs first, then other tests
test.describe.configure({ mode: 'serial' });

let homePage: Homepage;
let audioUtilities: AudioUtilities;

// Setup: Set some values for the repeat modal on surah 75 so that
// they are saved in the DB for the logged in user
test(
  'Setup: Save repeat modal values for logged in user',
  { tag: ['@setup', '@audio', '@repeat-audio'] },
  async ({ page, context, isMobile }) => {
    test.skip(isMobile, 'Setup is only needed on one device');

    homePage = new Homepage(page, context);
    audioUtilities = new AudioUtilities(page);

    await homePage.goTo('/75');

    const modal = await audioUtilities.openRepeatModal();

    // Change some values
    await audioUtilities.setRepeatModalValues(modal, '75:2', '75:2', '3', '3', '3');

    // Close the modal
    await audioUtilities.closeRepeatModal();
  },
);

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  audioUtilities = new AudioUtilities(page);

  await homePage.goTo('/75');
});

test.skip(
  'Values are persisted between sessions for logged in user',
  { tag: ['@slow', '@audio', '@repeat-audio'] },
  async () => {
    const modal = await audioUtilities.openRepeatModal();

    // Check that the values are persisted
    await expect(modal.locator('input[aria-owns="start"]')).toHaveValue('75:2');
    await expect(modal.locator('input[aria-owns="end"]')).toHaveValue('75:2');
    await expect(audioUtilities.getRepeatModalInput('playback-range')).toHaveText('3');
    await expect(audioUtilities.getRepeatModalInput('repeat-each-verse')).toHaveText('3');
    await expect(audioUtilities.getRepeatModalInput('delay-between-verses')).toHaveText('3');
  },
);
