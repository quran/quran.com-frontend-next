/* eslint-disable no-await-in-loop */
import { test, expect, Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

const banner = (page: Page) => page.getByTestId('learning-plan-banner');
const bannerImage = (page: Page) => banner(page).locator('img');

async function scrollToBottom(page: Page) {
  let previousHeight = 0;
  let currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  while (previousHeight !== currentHeight) {
    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500); // Wait for potential lazy-loaded content
    currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  }
}

async function waitForBannerPresent(page: Page) {
  await scrollToBottom(page);
  await expect(banner(page)).toBeVisible();
  return banner(page);
}

let homePage: Homepage;

test.describe('English language - rendering', () => {
  test.beforeEach(async ({ page, context }) => {
    homePage = new Homepage(page, context);
    await homePage.goTo('/67');
  });

  test('shows near the end, image + caption + CTA present', async ({ page }) => {
    await scrollToBottom(page);
    await waitForBannerPresent(page);
    await expect(bannerImage(page)).toBeVisible();
  });
});

test.describe('English language - navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    homePage = new Homepage(page, context);
    await homePage.goTo('/67');
  });

  test('clicking banner image navigates to LP', async ({ page }) => {
    await scrollToBottom(page);
    await waitForBannerPresent(page);
    await bannerImage(page).scrollIntoViewIfNeeded();
    await bannerImage(page).click();
    await expect(page).toHaveURL(/learning-plans/);
  });
});

test.describe('Non-English language', () => {
  test('Arabic version does not render the banner', async ({ page, context }) => {
    homePage = new Homepage(page, context);
    await homePage.goTo('/ar/67');
    await scrollToBottom(page);
    await expect(banner(page)).toHaveCount(0);
  });

  test('French version does not render the banner', async ({ page, context }) => {
    homePage = new Homepage(page, context);
    await homePage.goTo('/fr/67');
    await scrollToBottom(page);
    await expect(banner(page)).toHaveCount(0);
  });
});

test.describe('Other chapters', () => {
  test('Al-Fatiha (1) does not render the banner', async ({ page, context }) => {
    homePage = new Homepage(page, context);
    await homePage.goTo('/1');
    await scrollToBottom(page);
    await expect(banner(page)).toHaveCount(0);
  });
});
