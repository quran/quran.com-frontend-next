import { expect, test } from '@playwright/test';

import { expectToastError } from './form-helpers';
import {
  checkUploadSuccess,
  createTestImage,
  getProfilePictureButtons,
  uploadProfilePicture,
} from './personalization-form-helpers';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/profile');
});

const TEST_TAGS = ['@slow', '@auth', '@profile', '@personalization'];

const TIMEOUTS = {
  UPLOAD: 2000,
  ERROR: 2000,
  VISIBILITY: 10000,
  REMOVAL: 20000,
} as const;

test.describe('Form Display', () => {
  test(
    'should display profile picture section with upload button',
    { tag: TEST_TAGS },
    async ({ page }) => {
      await expect(page.getByText('Personalization')).toBeVisible();
      await expect(page.getByText('Profile Picture')).toBeVisible();

      const { uploadButton } = getProfilePictureButtons(page);
      await expect(uploadButton).toBeVisible();

      await expect(page.getByText(/Max 5 MB/i)).toBeVisible();
      await expect(page.getByText(/Only JPEG, JPG, PNG/i)).toBeVisible();
    },
  );

  test(
    'should show user icon when no profile picture is set',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const profilePictureSection = page.locator('[class*="profilePicture"]').first();
      await expect(profilePictureSection).toBeVisible();

      const userIcon = profilePictureSection.locator('svg, img').first();
      await expect(userIcon).toBeVisible();
    },
  );
});

test.describe('File Upload', () => {
  test('should upload a valid profile picture', { tag: TEST_TAGS }, async ({ page }) => {
    const testImage = createTestImage('small');

    await uploadProfilePicture(page, testImage, 'small-image.jpg', 'image/jpg');
    await page.waitForTimeout(TIMEOUTS.UPLOAD);

    const uploadSuccessful = await checkUploadSuccess(page, TIMEOUTS.VISIBILITY);
    expect(uploadSuccessful).toBeTruthy();
  });
});

test.describe('File Validation', () => {
  test('should reject file that exceeds 5MB size limit', { tag: TEST_TAGS }, async ({ page }) => {
    const largeImage = createTestImage('large');

    await uploadProfilePicture(page, largeImage, 'large-image.jpg', 'image/jpg');
    await page.waitForTimeout(TIMEOUTS.ERROR);

    await expectToastError(
      page,
      /file.*size.*exceeds.*limit|file.*too.*large/i,
      TIMEOUTS.VISIBILITY,
    );
  });

  test('should reject invalid file types', { tag: TEST_TAGS }, async ({ page }) => {
    const invalidFile = Buffer.from('This is not an image file');

    await uploadProfilePicture(page, invalidFile, 'test-file.txt', 'text/plain');
    await page.waitForTimeout(TIMEOUTS.ERROR);

    await expectToastError(
      page,
      /invalid.*file.*format|only.*jpeg.*jpg.*png/i,
      TIMEOUTS.VISIBILITY,
    );
  });
});

test.describe('Remove Functionality', () => {
  test(
    'should remove profile picture when remove button is clicked',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const { removeButton, uploadButton } = getProfilePictureButtons(page);
      const hasProfilePicture = await removeButton
        .isVisible({ timeout: TIMEOUTS.ERROR })
        .catch(() => false);

      if (!hasProfilePicture) {
        const testImage = createTestImage('small');
        await uploadProfilePicture(page, testImage, 'test-image.jpg', 'image/jpg');
        await page.waitForTimeout(TIMEOUTS.UPLOAD);
        await expect(removeButton).toBeVisible({ timeout: TIMEOUTS.REMOVAL });
      }

      await removeButton.click();
      await page.waitForTimeout(TIMEOUTS.ERROR);

      await expect(removeButton).not.toBeVisible({ timeout: TIMEOUTS.REMOVAL });
      await expect(uploadButton).toBeVisible();
    },
  );
});
