import { test, expect } from '@playwright/test';

import { mockStreakWithGoal, mockStreakWithoutGoal } from '@/tests/helpers/streak-api-mocks';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;
const MOCKED_CTA_URL = 'https://example.com/banner-target';

const mockUiSectionBanner = async (page) => {
  await page.route(
    '**/api/proxy/content/api/qdc/ui_sections/navbar_announcement**',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          uiSection: {
            key: 'navbar_announcement',
            url: MOCKED_CTA_URL,
            ctaText: 'Learn more',
            cacheTtlSeconds: 3600,
            metadata: {},
            content: {
              format: 'plain_text',
              value: 'Support Quran.com',
            },
            language: 'en',
          },
        }),
      });
    },
  );
};

test.describe('Banner Test - Logged In User', () => {
  test.beforeEach(async ({ page, context }) => {
    // Skip all tests if MSW is not enabled
    test.skip(
      !process.env.MSW_ENABLED || process.env.MSW_ENABLED === 'false',
      'MSW must be enabled for these tests',
    );

    await mockUiSectionBanner(page);
    homePage = new Homepage(page, context);
    await homePage.goTo();
  });

  test('should render dynamic CTA when user is logged in without goal', async ({
    page,
    context,
  }) => {
    mockStreakWithoutGoal(page);

    const banner = page.locator(`[data-testid="${TestId.BANNER}"]:visible`).first();
    const cta = banner.getByRole('link', { name: 'Learn more' });

    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', MOCKED_CTA_URL);

    const [newPage] = await Promise.all([context.waitForEvent('page'), cta.click({ force: true })]);

    await newPage.waitForLoadState('domcontentloaded');
    expect(newPage.url()).toContain(MOCKED_CTA_URL);
  });

  test('should render dynamic CTA when user is logged in with goal', async ({ page, context }) => {
    mockStreakWithGoal(page);

    const banner = page.locator(`[data-testid="${TestId.BANNER}"]:visible`).first();
    const cta = banner.getByRole('link', { name: 'Learn more' });

    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', MOCKED_CTA_URL);

    const [newPage] = await Promise.all([context.waitForEvent('page'), cta.click({ force: true })]);

    await newPage.waitForLoadState('domcontentloaded');
    expect(newPage.url()).toContain(MOCKED_CTA_URL);
  });
});
