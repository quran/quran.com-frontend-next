import { test, expect, Page } from '@playwright/test';

const LP_URL = '/learning-plans/the-rescuer-powerful-lessons-in-surah-al-mulk';
const BANNER_ROLE = { name: 'Learning plan promotion banner' };

const banner = (page: Page) => page.getByRole('complementary', BANNER_ROLE);
const bannerImage = (page: Page) =>
  banner(page).locator(
    'img[alt="The Rescuer: Powerful Lessons in Surah Mulk learning plan banner"]',
  );
const imageLink = (page: Page) => banner(page).locator('a').first();
const anyCTAInBanner = (page: Page) => banner(page).locator(`a[href="${LP_URL}"]`).first();

async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
}

async function waitForBannerPresent(page: Page) {
  await scrollToBottom(page);
  // Wait for virtualized list to settle
  await page.waitForLoadState('domcontentloaded');
  
  await expect
    .poll(
      async () => {
        return banner(page).count();
      },
      { timeout: 15000 },
    )
    .toBeGreaterThan(0);
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
    await expect(anyCTAInBanner(page)).toHaveAttribute('href', LP_URL);
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

  test('clicking CTA anchor navigates to LP', async ({ page }) => {
    await scrollToBottom(page);
    await waitForBannerPresent(page);
    await anyCTAInBanner(page).click();
    await expect(page).toHaveURL(LP_URL);
  });
});

test.describe('English language - viewport', () => {
  test('works across viewport sizes', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/67');
    await scrollToBottom(page);
    await waitForBannerPresent(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/67');
    await scrollToBottom(page);
    await waitForBannerPresent(page);
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

test.describe('Responsive', () => {
  test('mobile viewport renders mobile caption + CTA anchor', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/67');
    await scrollToBottom(page);
    await waitForBannerPresent(page);
    await expect(bannerImage(page)).toBeVisible();
    await expect(anyCTAInBanner(page)).toHaveAttribute('href', LP_URL);
  });
});

test.describe('Accessibility', () => {
  test('has ARIA role/label and allows keyboard focus on the image link', async ({ page }) => {
    await page.goto('/67');
    await scrollToBottom(page);
    await waitForBannerPresent(page);
    await expect(banner(page)).toHaveAttribute('aria-label', 'Learning plan promotion banner');
    const link = imageLink(page);
    await expect(link).toBeVisible();
    await link.focus();
    await expect(link).toBeFocused();
  });
});
