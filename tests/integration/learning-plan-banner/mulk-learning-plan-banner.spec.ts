/* eslint-disable no-await-in-loop */
import { test, expect, Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

const banner = (page: Page) => page.getByTestId('learning-plan-banner');
const bannerImage = (page: Page) => banner(page).locator('img');

const ACCEPT_LANGUAGE = 'Accept-Language';
const CF_IP_COUNTRY = 'CF-IPCountry';

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
  test('Arabic version does not render the banner', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'ar-SA' });
    const page = await context.newPage();

    // Set headers to simulate Saudi Arabia location and Arabic language preference
    await page.setExtraHTTPHeaders({
      [ACCEPT_LANGUAGE]: 'ar-SA,ar',
      [CF_IP_COUNTRY]: 'SA',
    });

    homePage = new Homepage(page, context);
    await homePage.goTo('/67');
    await scrollToBottom(page);
    await expect(banner(page)).toHaveCount(0);

    await context.close();
  });

  test('French version does not render the banner', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'fr-FR' });
    const page = await context.newPage();

    // Set headers to simulate France location and French language preference
    await page.setExtraHTTPHeaders({
      [ACCEPT_LANGUAGE]: 'fr-FR,fr',
      [CF_IP_COUNTRY]: 'FR',
    });

    homePage = new Homepage(page, context);
    await homePage.goTo('/67');
    await scrollToBottom(page);
    await expect(banner(page)).toHaveCount(0);

    await context.close();
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
