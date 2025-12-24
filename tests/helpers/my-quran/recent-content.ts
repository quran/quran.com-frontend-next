import { expect, type Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

/**
 * Clicks the Recent tab in My Quran page
 * Works for both desktop (button) and mobile (tab) views
 */
export const clickRecentTab = async (page: Page): Promise<void> => {
  const recentButton = page.getByTestId('recent-button');
  const recentTab = page.getByRole('tab', { name: /recent/i });

  const isButtonVisible = await recentButton.isVisible();
  await (isButtonVisible ? recentButton : recentTab).click();
};

/**
 * Navigates to a single verse and waits for page to load
 */
export const navigateToVerse = async (page: Page, verseKey: string): Promise<void> => {
  await page.goto(`/${verseKey}`, { waitUntil: 'networkidle' });

  await page.waitForTimeout(2000);
  await page.mouse.wheel(0, 100);

  await page.waitForTimeout(2000);
};

/**
 * Navigates to multiple verses sequentially
 * Used for testing recent reads list with multiple items
 */
export const navigateToVerses = async (
  homePage: Homepage,
  verseKeys: string[],
  isMobile: boolean,
): Promise<void> => {
  // eslint-disable-next-line no-restricted-syntax
  for (const verseKey of verseKeys) {
    // eslint-disable-next-line no-await-in-loop
    await homePage.goTo(`/${verseKey}`);
    if (isMobile) {
      // eslint-disable-next-line no-await-in-loop
      await homePage.page.mouse.wheel(0, 100);
    }
    // eslint-disable-next-line no-await-in-loop
    await homePage.page.waitForTimeout(100);
  }
};

/**
 * Navigates to a verse and waits for reading tracking to be persisted
 * Polls the readingTracker in localStorage until data is saved
 */
export const navigateToVerseAndWaitForTracking = async (
  homePage: Homepage,
  verseKey: string,
  isMobile: boolean,
): Promise<void> => {
  await homePage.goTo(`/${verseKey}`);

  if (isMobile) {
    await homePage.page.waitForTimeout(1500);
    await homePage.page.mouse.wheel(0, 100);
  }

  await expect
    .poll(async () => {
      const readingTracker = await homePage.getPersistedValue('readingTracker');
      return Object.keys(readingTracker?.recentReadingSessions || {}).length;
    })
    .toBeGreaterThan(0);
};
