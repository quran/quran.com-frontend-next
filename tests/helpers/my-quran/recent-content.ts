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

  const verseElement = page.getByTestId(`verse-${verseKey}`);
  await expect(verseElement).toBeVisible();

  await verseElement.scrollIntoViewIfNeeded();
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

    const verseElement = homePage.page.getByTestId(`verse-${verseKey}`);
    // eslint-disable-next-line no-await-in-loop
    await expect(verseElement).toBeVisible();

    if (isMobile) {
      // eslint-disable-next-line no-await-in-loop
      await homePage.page.mouse.wheel(0, 100);
    }
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

  const verseElement = homePage.page.getByTestId(`verse-${verseKey}`);
  await expect(verseElement).toBeVisible();

  if (isMobile) {
    await verseElement.scrollIntoViewIfNeeded();
  }

  await expect
    .poll(async () => {
      const readingTracker = await homePage.getPersistedValue('readingTracker');
      return Object.keys(readingTracker?.recentReadingSessions || {}).length;
    })
    .toBeGreaterThan(0);
};
