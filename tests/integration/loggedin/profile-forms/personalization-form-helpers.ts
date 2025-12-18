import { readFileSync } from 'fs';
import { join } from 'path';

import type { Locator, Page } from '@playwright/test';

/**
 * Gets the personalization section locator from the page
 * @param {Page} page - The Playwright page object
 * @returns {Locator} The personalization section locator
 */
export const getPersonalizationSection = (page: Page): Locator => {
  return page.getByTestId('personalization-section');
};

/**
 * Gets the file input locator for profile picture upload
 * @param {Page} page - The Playwright page object
 * @returns {Locator} The file input locator
 */
export const getFileInput = (page: Page): Locator => {
  return page.getByTestId('profile-picture-input');
};

/**
 * Gets button locators for profile picture actions
 * @param {Page} page - The Playwright page object
 * @returns {object} Object containing button locators
 */
export const getProfilePictureButtons = (page: Page) => ({
  uploadButton: page.getByRole('button', { name: 'Upload Picture' }),
  removeButton: page.getByRole('button', { name: 'Remove Picture' }),
});

/**
 * Creates a test image file as a Buffer from small.jpg or large.jpg
 * @param {'small' | 'large'} size - Size of the test image to use
 * @returns {Buffer} Buffer containing the test image
 */
export const createTestImage = (size: 'small' | 'large'): Buffer => {
  const fileName = size === 'small' ? 'small.jpg' : 'large.jpg';
  const imagePath = join(__dirname, fileName);
  return readFileSync(imagePath);
};

/**
 * Uploads a file to the profile picture input
 * @param {Page} page - The Playwright page object
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<void>}
 */
export const uploadProfilePicture = async (
  page: Page,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<void> => {
  const fileInput = getFileInput(page);
  await fileInput.setInputFiles({
    name: fileName,
    mimeType,
    buffer: fileBuffer,
  });
};

/**
 * Checks if upload was successful by looking for remove button or success toast
 * @param {Page} page - The Playwright page object
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} True if upload appears successful
 */
export const checkUploadSuccess = async (page: Page, timeout = 5000): Promise<boolean> => {
  const { removeButton } = getProfilePictureButtons(page);
  const successToast = page.getByText(/success|uploaded.*successfully/i);

  const hasRemoveButton = await removeButton.isVisible({ timeout }).catch(() => false);
  const hasSuccessToast = await successToast.isVisible({ timeout }).catch(() => false);

  return hasRemoveButton || hasSuccessToast;
};
