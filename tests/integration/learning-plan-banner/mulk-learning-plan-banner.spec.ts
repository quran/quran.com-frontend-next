import { test, expect, Page } from '@playwright/test';

const LP_URL = '/learning-plans/the-rescuer-powerful-lessons-in-surah-al-mulk';

const banner = (page: Page) => page.getByTestId('learning-plan-banner');
const bannerImage = (page: Page) => banner(page).locator('img');
const imageLink = (page: Page) => banner(page).locator('a').first();

async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
}

async function waitForBannerPresent(page: Page) {
  await scrollToBottom(page);
  await expect(banner(page)).toBeVisible();
  return banner(page);
}

test.describe('English language - rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/67');
  });

  test('shows near the end, image + caption + CTA present', async ({ page }) => {
    await scrollToBottom(page);
    await waitForBannerPresent(page);
    await expect(bannerImage(page)).toBeVisible();
    await expect(imageLink(page)).toHaveAttribute('href', LP_URL);
  });
});

test.describe('English language - navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/67');
  });

  test('clicking banner image navigates to LP', async ({ page }) => {
    await scrollToBottom(page);
    await waitForBannerPresent(page);
    await imageLink(page).click();
    await expect(page).toHaveURL(LP_URL);
  });
});

test.describe('Non-English language', () => {
  test('Arabic version does not render the banner', async ({ page }) => {
    await page.goto('/ar/67');
    await scrollToBottom(page);
    await expect(banner(page)).toHaveCount(0);
  });

  test('French version does not render the banner', async ({ page }) => {
    await page.goto('/fr/67');
    await scrollToBottom(page);
    await expect(banner(page)).toHaveCount(0);
  });
});

test.describe('Other chapters', () => {
  test('Al-Fatiha (1) does not render the banner', async ({ page }) => {
    await page.goto('/1');
    await scrollToBottom(page);
    await expect(banner(page)).toHaveCount(0);
  });

  test('Al-Baqarah (2) does not render the banner', async ({ page }) => {
    await page.goto('/2');
    await scrollToBottom(page);
    await expect(banner(page)).toHaveCount(0);
  });
});
