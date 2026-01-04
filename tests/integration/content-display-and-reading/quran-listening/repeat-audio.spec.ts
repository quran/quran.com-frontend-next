import { test, expect } from '@playwright/test';

import AudioUtilities from '@/tests/POM/audio-utilities';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;
let audioUtilities: AudioUtilities;

test.beforeEach(async ({ page, context, isMobile }) => {
  test.skip(isMobile, 'Repeat audio tests does not need to run on mobile devices');

  homePage = new Homepage(page, context);
  audioUtilities = new AudioUtilities(page);

  await homePage.goTo('/1');
});

test(
  'Opening repeat modal from overflow menu displays modal content',
  { tag: ['@audio', '@repeat-audio'] },
  async () => {
    const modal = await audioUtilities.openRepeatModal();
    await expect(modal).toBeVisible({ timeout: 5000 });
  },
);

test(
  'Repeat modal has persistent values when closing and opening',
  { tag: ['@slow', '@audio', '@repeat-audio'] },
  async () => {
    const modal = await audioUtilities.openRepeatModal();

    // Change some values
    await audioUtilities.setRepeatModalValues(modal, '1:2', '1:2', '5', '5', '5');

    // Close the modal
    await audioUtilities.closeRepeatModal();

    // Reopen the modal
    const modal2 = await audioUtilities.openRepeatModal();
    // Check that the values are persisted
    await expect(modal2.locator('input[aria-owns="start"]')).toHaveValue('1:2');
    await expect(modal2.locator('input[aria-owns="end"]')).toHaveValue('1:2');
    await expect(audioUtilities.getRepeatModalInput('playback-range')).toHaveText('5');
    await expect(audioUtilities.getRepeatModalInput('repeat-each-verse')).toHaveText('5');
    await expect(audioUtilities.getRepeatModalInput('delay-between-verses')).toHaveText('5');
  },
);

test(
  'Repeat modal has persistent values between sessions',
  { tag: ['@slow', '@audio', '@repeat-audio'] },
  async () => {
    const modal = await audioUtilities.openRepeatModal();

    // Change some values
    await audioUtilities.setRepeatModalValues(modal, '1:2', '1:2', '5', '5', '5');

    // Close the modal
    await audioUtilities.closeRepeatModal();

    // Reload the page to simulate a new session
    await homePage.reload();

    const modal2 = await audioUtilities.openRepeatModal();
    // Check that the values are persisted
    await expect(modal2.locator('input[aria-owns="start"]')).toHaveValue('1:2');
    await expect(modal2.locator('input[aria-owns="end"]')).toHaveValue('1:2');
    await expect(audioUtilities.getRepeatModalInput('playback-range')).toHaveText('5');
    await expect(audioUtilities.getRepeatModalInput('repeat-each-verse')).toHaveText('5');
    await expect(audioUtilities.getRepeatModalInput('delay-between-verses')).toHaveText('5');
  },
);

test(
  'Repeat modal lost only the verse values when switching chapters',
  { tag: ['@slow', '@audio', '@repeat-audio'] },
  async () => {
    const modal = await audioUtilities.openRepeatModal();

    // Change some values
    await audioUtilities.setRepeatModalValues(modal, '1:2', '1:2', '5', '5', '5');

    // Close the modal
    await audioUtilities.closeRepeatModal();

    // Switch chapters
    await homePage.goTo('/2');

    const modal2 = await audioUtilities.openRepeatModal();
    // Check that only the verse values are reset
    await expect(modal2.locator('input[aria-owns="start"]')).toHaveValue('2:1');
    await expect(modal2.locator('input[aria-owns="end"]')).toHaveValue('2:286');
    await expect(audioUtilities.getRepeatModalInput('playback-range')).toHaveText('5');
    await expect(audioUtilities.getRepeatModalInput('repeat-each-verse')).toHaveText('5');
    await expect(audioUtilities.getRepeatModalInput('delay-between-verses')).toHaveText('5');
  },
);

test(
  'Going back to a surah retains repeat modal values',
  { tag: ['@slow', '@audio', '@repeat-audio'] },
  async () => {
    const modal = await audioUtilities.openRepeatModal();

    // Change some values
    await audioUtilities.setRepeatModalValues(modal, '1:2', '1:2', '5', '5', '5');

    // Close the modal
    await audioUtilities.closeRepeatModal();

    // Switch chapters
    await homePage.goTo('/2');

    // Open and close the modal again to simulate user checking values
    await audioUtilities.openRepeatModal();
    await audioUtilities.closeRepeatModal(false);

    // Go back to first chapter
    await homePage.goTo('/1');

    const modal2 = await audioUtilities.openRepeatModal();
    // Check that the values are persisted
    await expect(modal2.locator('input[aria-owns="start"]')).toHaveValue('1:2');
    await expect(modal2.locator('input[aria-owns="end"]')).toHaveValue('1:2');
    await expect(audioUtilities.getRepeatModalInput('playback-range')).toHaveText('5');
    await expect(audioUtilities.getRepeatModalInput('repeat-each-verse')).toHaveText('5');
    await expect(audioUtilities.getRepeatModalInput('delay-between-verses')).toHaveText('5');
  },
);
