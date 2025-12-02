import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, isMobile, context }) => {
  test.slow();

  homePage = new Homepage(page, context);

  await homePage.goTo('/78');

  // Switch to mushaf view
  await homePage.enableMushafMode(isMobile);
});

test(
  'Mushaf displays exactly 15 lines per page',
  { tag: ['@slow', '@mushaf', '@layout'] },
  async ({ page }) => {
    const pageContainer = page.locator('#page-582');
    await expect(pageContainer).toBeVisible();

    // Verify that all lines (from 3 to 15) for this surah are visible
    for (let i = 3; i <= 15; i += 1) {
      const line = pageContainer.locator(`#Page582-Line${i}`);
      // eslint-disable-next-line no-await-in-loop
      await expect(line).toBeVisible();
    }

    // Verify that line 16 is not present
    const line16 = pageContainer.locator('#Page582-Line16');
    await expect(line16).toHaveCount(0);
  },
);

test('Mushaf displays all page of the Surah', { tag: ['@mushaf', '@layout'] }, async ({ page }) => {
  // Verify that all pages for this surah are visible (page 582 and 583 for Surah An-Naba)
  for (let i = 582; i <= 583; i += 1) {
    const pageContainer = page.locator(`#page-${i}`);
    // eslint-disable-next-line no-await-in-loop
    await expect(pageContainer).toBeVisible();
  }

  // Verify that page 584 is not present
  const page584 = page.locator('#page-584');
  await expect(page584).toHaveCount(0);

  // Verify that all lines (from 1 to 7 for Surah An-Naba) for page 583 are visible
  const page583 = page.locator('#page-583');
  for (let i = 1; i <= 7; i += 1) {
    const line = page583.locator(`#Page583-Line${i}`);
    // eslint-disable-next-line no-await-in-loop
    await expect(line).toBeVisible();
  }

  // Verify that line 8 is not present
  const line8 = page583.locator('#Page583-Line8');
  await expect(line8).toHaveCount(0);
});

test(
  'Next Surah Button works correctly in Mushaf view',
  { tag: ['@mushaf', '@navigation'] },
  async ({ page, isMobile }) => {
    // Click on the next surah button
    await Promise.all([page.getByTestId('next-surah-button').click(), page.waitForURL('/79')]);
    await expect(page).toHaveURL(/\/79$/);

    // Verify we are still in the mushaf view
    if (isMobile) {
      await expect(page.getByTestId('reading-tab')).toHaveAttribute('data-is-selected', 'true');
    } else {
      await expect(page.getByTestId('reading-button')).toHaveAttribute('data-is-selected', 'true');
    }
  },
);

test(
  'Chapter Beginning Button works correctly in Mushaf view',
  { tag: ['@mushaf', '@navigation'] },
  async ({ page }) => {
    // Scroll down a bit to make sure we are not at the top of the page
    await page.evaluate(() => window.scrollTo(0, 500));

    // Click on the chapter beginning button
    await page.getByTestId('chapter-beginning-button').click();
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(1);

    // We should be at the top of the page now
    const currentScrollPosition = await page.evaluate(() => window.scrollY);
    expect(currentScrollPosition).toBeLessThan(1);
  },
);

test(
  'Previous Surah Button works correctly in Mushaf view',
  { tag: ['@mushaf', '@navigation'] },
  async ({ page, isMobile }) => {
    // Click on the previous surah button
    await Promise.all([page.getByTestId('previous-surah-button').click(), page.waitForURL('/77')]);
    await expect(page).toHaveURL(/\/77$/);

    // Verify we are still in the mushaf view
    if (isMobile) {
      await expect(page.getByTestId('reading-tab')).toHaveAttribute('data-is-selected', 'true');
    } else {
      await expect(page.getByTestId('reading-button')).toHaveAttribute('data-is-selected', 'true');
    }
  },
);

test(
  'Previous Surah Button is not displayed on first Surah in Mushaf view',
  { tag: ['@mushaf', '@navigation'] },
  async ({ page }) => {
    await homePage.goTo('/1');

    // Verify the previous surah button is not visible
    const previousSurahButton = page.getByTestId('previous-surah-button');
    await expect(previousSurahButton).toHaveCount(0);
  },
);

test(
  'Next Surah Button is not displayed on last Surah in Mushaf view',
  { tag: ['@mushaf', '@navigation'] },
  async ({ page }) => {
    await homePage.goTo('/114');

    // Verify the next surah button is not visible
    const nextSurahButton = page.getByTestId('next-surah-button');
    await expect(nextSurahButton).toHaveCount(0);
  },
);

test(
  'Selected mushaf view persists after page reload',
  { tag: ['@slow', '@mushaf', '@persistence'] },
  async ({ page, isMobile }) => {
    const mushafIndicator = isMobile
      ? page.getByTestId('reading-tab')
      : page.getByTestId('reading-button');
    await expect(mushafIndicator).toHaveAttribute('data-is-selected', 'true');

    await page.waitForTimeout(1000); // wait for 1 second

    // refresh the page
    await homePage.reload();

    // Verify we are still in the mushaf view
    if (isMobile) {
      await expect(page.getByTestId('reading-tab')).toHaveAttribute('data-is-selected', 'true');
    } else {
      await expect(page.getByTestId('reading-button')).toHaveAttribute('data-is-selected', 'true');
    }
  },
);
