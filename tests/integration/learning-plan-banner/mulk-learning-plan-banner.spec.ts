import { test, expect, Page, Locator } from '@playwright/test';

const LP_URL = '/learning-plans/the-rescuer-powerful-lessons-in-surah-al-mulk';
const BANNER_ROLE = { name: 'Learning plan promotion' };

const banner = (page: Page) => page.getByRole('region', BANNER_ROLE);
const bannerImage = (page: Page) =>
  banner(page).locator(
    'img[alt="The Rescuer: Powerful Lessons in Surah Mulk learning plan banner"]',
  );
const imageLink = (page: Page) =>
  page.locator('a[aria-label="View The Rescuer learning plan for Surah Al-Mulk"]');
const anyCTAInBanner = (page: Page) => banner(page).locator(`a[href="${LP_URL}"]`).first();

const getOpacity = async (locator: Locator) =>
  locator.evaluate((el) => parseFloat(window.getComputedStyle(el as HTMLElement).opacity));

async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
}

async function expectBannerNotYetVisible(page: Page) {
  const $banner = banner(page);
  await expect($banner).toHaveCount(1);
  await expect.poll(async () => getOpacity($banner)).toBeLessThan(0.01);
}

async function waitForBannerVisible(page: Page) {
  const $banner = banner(page);
  await expect($banner).toHaveCount(1);
  await page.waitForFunction((lpUrl) => {
    const el = document.querySelector('[role="region"][aria-label="Learning plan promotion"]');
    if (!el) return false;
    const opacity = parseFloat(window.getComputedStyle(el as HTMLElement).opacity);
    return opacity > 0.95 || !!(el as HTMLElement).querySelector(`a[href="${lpUrl}"]`);
  }, LP_URL);
  return $banner;
}

test.describe('English language - rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/67');
  });

  test('shows near the end, image + caption + CTA present', async ({ page }) => {
    await expectBannerNotYetVisible(page);
    await scrollToBottom(page);
    await waitForBannerVisible(page);
    await expect(bannerImage(page)).toBeVisible();
    await expect(imageLink(page)).toHaveAttribute('href', LP_URL);
    await expect(anyCTAInBanner(page)).toHaveAttribute('href', LP_URL);
  });

  test('not shown before scrolling near the end', async ({ page }) => {
    await expectBannerNotYetVisible(page);
  });
});

test.describe('English language - navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/67');
  });

  test('clicking banner image navigates to LP', async ({ page }) => {
    await scrollToBottom(page);
    await waitForBannerVisible(page);
    await imageLink(page).click();
    await expect(page).toHaveURL(LP_URL);
  });

  test('clicking CTA anchor navigates to LP', async ({ page }) => {
    await scrollToBottom(page);
    await waitForBannerVisible(page);
    await anyCTAInBanner(page).click();
    await expect(page).toHaveURL(LP_URL);
  });
});

test.describe('English language - visibility behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/67');
  });

  test('once visible, it stays visible even if user scrolls away', async ({ page }) => {
    await scrollToBottom(page);
    await waitForBannerVisible(page);
    await page.evaluate(() => window.scrollTo(0, Math.max(0, window.scrollY - 1200)));
    await expect(banner(page)).toHaveClass(/visible/);
    await expect(anyCTAInBanner(page)).toHaveAttribute('href', LP_URL);
    await scrollToBottom(page);
    await expect(banner(page)).toHaveClass(/visible/);
  });
});

test.describe('English language - viewport', () => {
  test('works across viewport sizes', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/67');
    await scrollToBottom(page);
    await waitForBannerVisible(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/67');
    await scrollToBottom(page);
    await waitForBannerVisible(page);
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
    await waitForBannerVisible(page);
    await expect(bannerImage(page)).toBeVisible();
    await expect(anyCTAInBanner(page)).toHaveAttribute('href', LP_URL);
  });
});

test.describe('Accessibility', () => {
  test('has ARIA role/label and allows keyboard focus on the image link', async ({ page }) => {
    await page.goto('/67');
    await scrollToBottom(page);
    await waitForBannerVisible(page);
    await expect(banner(page)).toHaveAttribute('role', 'region');
    await expect(banner(page)).toHaveAttribute('aria-label', 'Learning plan promotion');
    const link = imageLink(page);
    await expect(link).toBeVisible();
    await link.focus();
    await expect(link).toBeFocused();
  });
});
